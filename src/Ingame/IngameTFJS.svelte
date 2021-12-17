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
        ingameRawScores,
        ingameEvalScreenShouldShow,
        ingameJudgementTotals,
        ingameAdjustedScores,
        ingameFinalScore,
        ingameRawJudgements,
        ingameVideo,
        ingameShouldScore,
        ingameNumStars,
    } from '../stores';
    import { GetFrameNumberFromTime, sleep, GetVideoStartAndEndTimeFromMetadata } from '../utils';
    import { AnalyzePose } from './Scoring/Scoring';
    import { DEFAULT_ACCURACY_SCORE_THRESHOLD } from './Scoring/Defaults';
    import { GetNumStarsFromPerfectPercentage } from './Scoring/Stars';
    import {
        GetPerfectPercentage,
        GetTotalFinalScore,
        GetScoringDurationFromInOutScoringAreas
    } from './Scoring/Judgements';
    
    const shouldDisplayDebugScores = false;

    let raf;
    let personDetected = false;

    const onFrame = async () => {
        const pose = await tfjs.detectFrame($ingameCameraCanvas);

        if (pose) {
            if (!personDetected) {
                const keypointsUnderThreshold = pose.keypoints.filter(
                    (keypoint) =>
                        keypoint.score < DEFAULT_ACCURACY_SCORE_THRESHOLD
                );
                personDetected = keypointsUnderThreshold.length == 0;
            } else if (!$ingameVideo.paused && $ingameShouldScore) {
                AnalyzePose(
                    pose,
                    $ingameTime,
                    $playGameMetadata,
                    $ingameRawScores,
                    $ingameAdjustedScores,
                    $ingameJudgementTotals,
                    $ingameRawJudgements
                );
            }
        }

        if (!$ingameEvalScreenShouldShow) {
            raf = window.requestAnimationFrame(onFrame);
        } else {
            const startEndTime =
                GetVideoStartAndEndTimeFromMetadata($playGameMetadata);
            const scoringDuration = GetScoringDurationFromInOutScoringAreas(
                $playGameMetadata.duration,
                startEndTime.start,
                startEndTime.end,
                {}
            );
            $ingameFinalScore = GetTotalFinalScore(
                $ingameJudgementTotals,
                scoringDuration
            );
        }
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

    const UpdateNumStars = (judgementTotals) => {
        const startEndTime =
            GetVideoStartAndEndTimeFromMetadata($playGameMetadata);
        const scoringDuration = GetScoringDurationFromInOutScoringAreas(
            $playGameMetadata.duration,
            startEndTime.start,
            startEndTime.end,
            {}
        );
        return GetNumStarsFromPerfectPercentage(
            GetPerfectPercentage(judgementTotals, scoringDuration)
        );
    };

    $: {
        $ingameNumStars = UpdateNumStars($ingameJudgementTotals);
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

{#if shouldDisplayDebugScores}
    <h1>{$testIngameScores}</h1>
{/if}

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
