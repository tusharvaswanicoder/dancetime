<script>
    import { onDestroy, onMount } from 'svelte';
    import tfjs from '../tensorflow/TFJS';
    import {
        testIngameScores,
        ingameCamera,
        TFJSReady,
        playGameMetadata,
        ingameTime
    } from '../stores';
    import { SplitPoseByGroupXY } from '../tensorflow/KeypointGroupSplits.js';
    import { GetFrameNumberFromTime, GetKeypointsForFrame, sleep } from '../utils';
    import { shapeSimilarity } from 'curve-matcher';
    
    let raf;
    let personDetected = false;
    
    const analyzePose = async (pose, frame) => {
        // Detect if there is a person in the frame by checking all keypoints scores to see if all points are good
        if (!personDetected) {
            const keypointsUnderThreshold = pose.keypoints.filter((keypoint) => keypoint.score < 0.5);
            personDetected = keypointsUnderThreshold.length == 0;
        }
        
        const videoFrameKeypoints = GetKeypointsForFrame($playGameMetadata.keypoints, frame);
        if (!videoFrameKeypoints) {
            // Set scores to 0?
            return;
        }
        
        const groups = SplitPoseByGroupXY(pose.keypoints);
        const model_groups = SplitPoseByGroupXY(videoFrameKeypoints.keypoints);
        
        let scoresString = '';
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
            
            scoresString += `${group_name}: ${similarity.toFixed(2)}   `
        }
        
        $testIngameScores = scoresString;
    }
    
    const onFrame = async () => {
        const pose = await tfjs.detectFrame($ingameCamera);
        
        if (pose) {
            analyzePose(pose, GetFrameNumberFromTime($ingameTime, $playGameMetadata.fps));
        } else {
            // Set all scores to 0
        }
        
        raf = window.requestAnimationFrame(onFrame);
    }
    
    const startTFJS = async () => {
        while (!$ingameCamera || $ingameCamera.readyState != 4) {
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
