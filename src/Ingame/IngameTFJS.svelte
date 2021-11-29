<script>
    import { onDestroy, onMount } from 'svelte';
    import tfjs from '../tensorflow/TFJS';
    import {
        testIngameScores,
        ingameCamera,
        ingameCameraCanvas,
        TFJSReady,
        playGameMetadata,
        ingameTime,
        currentFrameRawScores,
        ingameRawScores,
        currentAverageScore,
        ingameCurrentJudgement
    } from '../stores';
    import { SplitPoseByGroupXY } from '../tensorflow/KeypointGroupSplits.js';
    import {
        GetFrameNumberFromTime,
        GetKeypointsForFrame,
        sleep,
    } from '../utils';
    import {
        GetScoreFromGroups,
        DEFAULT_ACCURACY_SCORE_THRESHOLD,
        GetCurrentAvgScore,
        GetJudgementFromScore,
        JUDGEMENT_VISUALS,
        GetCurrentTopXLastScores
    } from './Scoring';
    import { shapeSimilarity } from 'curve-matcher';

    let raf;
    let personDetected = false;

    const analyzePose = async (pose, frame) => {
        // Detect if there is a person in the frame by checking all keypoints scores to see if all points are good
        if (!personDetected) {
            const keypointsUnderThreshold = pose.keypoints.filter(
                (keypoint) => keypoint.score < DEFAULT_ACCURACY_SCORE_THRESHOLD
            );
            personDetected = keypointsUnderThreshold.length == 0;
        }

        if (pose.score < DEFAULT_ACCURACY_SCORE_THRESHOLD) {
            $testIngameScores = `0.00`;
            return;
        }

        const videoFrameKeypoints = GetKeypointsForFrame(
            $playGameMetadata.keypoints,
            frame
        );
        if (!videoFrameKeypoints) {
            // Set scores to 0?
            $testIngameScores = `0.00`;
            return;
        }

        if (!pose.keypoints || !videoFrameKeypoints.keypoints) {
            $testIngameScores = `0.00`;
            return;
        }

        const groups = SplitPoseByGroupXY(pose.keypoints);
        const model_groups = SplitPoseByGroupXY(videoFrameKeypoints.keypoints);

        let scoresString = '';
        const group_scores = {};
        for (const group_name in groups) {
            const similarity = shapeSimilarity(
                model_groups[group_name],
                groups[group_name],
                {
                    restrictRotationAngle: 0.05 * Math.PI,
                    estimationPoints: 50,
                    rotations: 10,
                }
            );

            group_scores[group_name] = similarity;
        }

        const score = GetScoreFromGroups(group_scores);
        $currentFrameRawScores = score;
        $ingameRawScores[frame] = score;

        $currentAverageScore = GetCurrentAvgScore(
            $ingameRawScores,
            frame,
            $playGameMetadata.fps
        );
        const currentAvg5Score = GetCurrentTopXLastScores(
            $ingameRawScores,
            frame,
            $playGameMetadata.fps
        );

        scoresString = `${$currentAverageScore.toFixed(3)} - ${currentAvg5Score.toFixed(3)}`;

        for (const group_name in groups) {
            scoresString += `   ${group_name}: ${score.groups[
                group_name
            ].toFixed(2)}`;
        }

        const judgement = GetJudgementFromScore(currentAvg5Score);
        scoresString += ` -- ${JUDGEMENT_VISUALS[judgement].name}`;
        $ingameCurrentJudgement = judgement;

        $testIngameScores = scoresString;
    };

    const onFrame = async () => {
        const pose = await tfjs.detectFrame($ingameCameraCanvas);

        if (pose) {
            analyzePose(
                pose,
                GetFrameNumberFromTime($ingameTime, $playGameMetadata.fps)
            );
        } else {
            // Set all scores to 0
        }

        raf = window.requestAnimationFrame(onFrame);
    };

    const startTFJS = async () => {
        while (
            !$ingameCamera ||
            $ingameCamera.readyState != 4 ||
            !$ingameCameraCanvas
        ) {
            await sleep(500);
        }

        await tfjs.initialize();
        await onFrame();
    };

    $: {
        if (!$TFJSReady && personDetected) {
            $TFJSReady = true;
            // Only become ready when a person is detected
        }
    }

    onMount(() => {
        startTFJS();
    });

    onDestroy(() => {
        if (raf) {
            window.cancelAnimationFrame(raf);
        }
    });
</script>

<h1>{$testIngameScores}</h1>

<style>
    h1 {
        color: yellow;
        font-weight: bold;
        font-size: 3rem;
        position: absolute;
        top: 0;
        left: 0;
        margin: 10px;
        z-index: 50;
    }
</style>
