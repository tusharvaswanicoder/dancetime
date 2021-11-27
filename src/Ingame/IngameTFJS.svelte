<script>
    import { onDestroy, onMount } from 'svelte';
    import tfjs from '../tensorflow/TFJS';
    import {
        testIngameScores,
        ingameCamera,
        ingameCameraCanvas,
        TFJSReady,
        playGameMetadata,
        ingameTime
    } from '../stores';
    import { SplitPoseByGroupXY } from '../tensorflow/KeypointGroupSplits.js';
    import { GetFrameNumberFromTime, GetKeypointsForFrame, sleep } from '../utils';
    import { GetScoreFromGroups, DEFAULT_ACCURACY_SCORE_THRESHOLD } from './Scoring';
    import { shapeSimilarity } from 'curve-matcher';
    
    let raf;
    let personDetected = false;
    
    const analyzePose = async (pose, frame) => {
        // Detect if there is a person in the frame by checking all keypoints scores to see if all points are good
        if (!personDetected) {
            const keypointsUnderThreshold = pose.keypoints.filter((keypoint) => keypoint.score < DEFAULT_ACCURACY_SCORE_THRESHOLD);
            personDetected = keypointsUnderThreshold.length == 0;
        }
        
        if (pose.score < DEFAULT_ACCURACY_SCORE_THRESHOLD) {
            $testIngameScores = `0.00`;
            return;
        }
        
        const videoFrameKeypoints = GetKeypointsForFrame($playGameMetadata.keypoints, frame);
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
                    restrictRotationAngle: 0.1 * Math.PI,
                    estimationPoints: 20,
                    rotations: 10,
                }
            );
            
            group_scores[group_name] = similarity;
        }
        
        const score = GetScoreFromGroups(group_scores);
        scoresString = `${score.overall.toFixed(3)}`;
        
        for (const group_name in groups) {
            scoresString += `   ${group_name}: ${score.groups[group_name].toFixed(2)}`;
        }
        
        $testIngameScores = scoresString;
    }
    
    const onFrame = async () => {
        const pose = await tfjs.detectFrame($ingameCameraCanvas);
        
        if (pose) {
            analyzePose(pose, GetFrameNumberFromTime($ingameTime, $playGameMetadata.fps));
        } else {
            // Set all scores to 0
        }
        
        raf = window.requestAnimationFrame(onFrame);
    }
    
    const startTFJS = async () => {
        while (!$ingameCamera || $ingameCamera.readyState != 4 || !$ingameCameraCanvas) {
            await sleep(500);
        }
        
        await tfjs.initialize();
        await onFrame();
    }
    
    $: {
        if (!$TFJSReady && personDetected){
            $TFJSReady = true;
            // Only become ready when a person is detected
        }
    }
    
    onMount(() => {
        startTFJS();
    })
    
    onDestroy(() => {
        if (raf) {
            window.cancelAnimationFrame(raf);
        }
    })
</script>
