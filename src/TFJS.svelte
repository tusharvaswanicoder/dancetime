<script>
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import { cameraStore, cameraCanvasStore } from "./stores.js";
    const dispatch = createEventDispatcher();
    const loaded = () => dispatch("tfjs-loaded");
    
    import {ComparePoses, SplitPoseByGroupXY} from "./PoseCompare.js"
    import {TestKeypoints, TestWebcamKeypoints} from "./TestKeypoints"
    import { shapeSimilarity } from 'curve-matcher';
    
    let mounted = false;
    let tfjsReady = false;
    let frame;
    let detector;

    let movenetStarted = false;
    let ctx;
    $: ctx = $cameraCanvasStore && $cameraCanvasStore.getContext("2d");
    let compared_groups = {}

    async function runPosenet() {
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        detect();
    }

    async function detect() {
        if (ctx)
        {
            clearCanvas();
        }

        if ($cameraStore && $cameraStore.readyState == 4 && movenetStarted) {
            // Get Video Properties
            // Make Detections
            const poses = await detector.estimatePoses($cameraStore);

            if (ctx) {
                for (const pose of poses) {
                    console.log(pose)
                    drawCanvas(pose);
                    
                    TestCompareGroupsNew(pose);
                    
                    // const compared_groups = ComparePoses(TestKeypoints.keypoints_normalized, pose.keypoints_normalized)
                    
                    // let i = 1;
                    // for (const group_type in compared_groups)
                    // {
                    //     const group = compared_groups[group_type];
                    //     ctx.font = '24px serif';
                    //     ctx.fillStyle = "White";
                    //     ctx.strokeStyle = "White";
                    //     ctx.fillText(`${group_type}: ${group.rotation}`, 0, i * 30);
                    //     const keypoints = group.input_transformed.to2DArray().map((point) => 
                    //     {
                    //         return {x: point[0], y: point[1]}
                    //     })
                    //     drawKeypointsTransformed(normalizedKeypointsToVideoSize(keypoints, $cameraStore), group_type);
                    //     i++;
                    // }
                }
            }
        }
        
        drawCanvas(TestKeypoints, "Green");
        // drawCanvas(TestWebcamKeypoints, "Red");
        // CompareTestPoses();
        
        frame = requestAnimationFrame(detect);
    }
    
    function TestCompareGroupsNew(pose)
    {
        const groups = SplitPoseByGroupXY(pose.keypoints)
        const model_groups = SplitPoseByGroupXY(TestKeypoints.keypoints)
        
        let i = 1;
        for (const group_name in groups)
        {
            const similarity = shapeSimilarity(model_groups[group_name], groups[group_name], 
            {
                restrictRotationAngle: 0.1 * Math.PI,
                estimationPoints: 20,
                rotations: 10
            });
            ctx.font = '24px serif';
            ctx.fillStyle = "White";
            ctx.strokeStyle = "White";
            ctx.fillText(`${group_name}: ${similarity}`, 0, i * 30);
            i++;
        }
    }
    
    function TestCompareGroups()
    {
        compared_groups = ComparePoses(TestKeypoints.keypoints_normalized, TestWebcamKeypoints.keypoints_normalized);
        console.log(compared_groups)
    }
    
    function CompareTestPoses()
    {
        let i = 1;
        for (const group_type in compared_groups)
        {
            const group = compared_groups[group_type];
            ctx.font = '24px serif';
            const colors = 
            {
                "HEAD": "Blue",
                "TORSO": "Purple",
                "LEGS": "Pink"
            }
            ctx.fillStyle = colors[group_type];
            ctx.strokeStyle = colors[group_type];
            ctx.fillText(`${group_type}: ${group.rotation}`, 0, i * 30);
            const keypoints = group.input_transformed.to2DArray().map((point) => 
            {
                return {x: point[0], y: point[1]}
            })
            drawKeypointsTransformed(normalizedKeypointsToVideoSize(keypoints, $cameraStore), group_type);
            // drawKeypointsTransformed(keypoints, group_type);
            i++;
        }
    }
    
    function clearCanvas()
    {
        ctx.clearRect(
                    0,
                    0,
                    $cameraCanvasStore.width,
                    $cameraCanvasStore.height
                );
    }

    function drawCanvas(pose, color) {
        if (pose.keypoints != null) {
            if (!pose.keypoints_normalized)
            {
                pose.keypoints_normalized =
                    poseDetection.calculators.keypointsToNormalizedKeypoints(
                        pose.keypoints,
                        { width: $cameraStore.videoWidth, height: $cameraStore.videoHeight }
                    );
            }
            pose.keypoints = normalizedKeypointsToVideoSize(pose.keypoints_normalized, $cameraStore)
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            drawKeypoints(pose.keypoints);
            drawSkeleton(pose.keypoints, pose.id);
        }
    }

    function normalizedKeypointsToVideoSize(keypoints, camera) {
        return keypoints.map((keypoint) => {
            return {
                ...keypoint,
                x: keypoint.x * camera.width,
                y: keypoint.y * camera.height,
            };
        });
    }

    function drawKeypointsTransformed(keypoints, group_type)
    {
        ctx.lineWidth = 0;

        for (let i = 0; i < keypoints.length; i++)
        {
            drawKeypoint(keypoints[i]);
        }
    }
    
    /**
     * Draw the keypoints on the video.
     * @param keypoints A list of keypoints.
     */
    function drawKeypoints(keypoints) {
        const keypointInd = poseDetection.util.getKeypointIndexBySide(
            poseDetection.SupportedModels.MoveNet
        );
        ctx.lineWidth = 2;

        for (const i of keypointInd.middle) {
            drawKeypoint(keypoints[i], i);
        }

        for (const i of keypointInd.left) {
            drawKeypoint(keypoints[i], i);
        }

        for (const i of keypointInd.right) {
            drawKeypoint(keypoints[i], i);
        }
    }

    function drawKeypoint(keypoint, i) {
        // If score is null, just show the keypoint.
        const score = keypoint.score != null ? keypoint.score : 1;
        const scoreThreshold = 0.3;

        if (score >= scoreThreshold) {
            const circle = new Path2D();
            circle.arc(keypoint.x, keypoint.y, 2, 0, 2 * Math.PI);
            ctx.fill(circle);
            ctx.stroke(circle);
        }
    }

    /**
     * Draw the skeleton of a body on the video.
     * @param keypoints A list of keypoints.
     */
    function drawSkeleton(keypoints, poseId) {
        // Each poseId is mapped to a color in the color palette.
        // const color =
        //     params.STATE.modelConfig.enableTracking && poseId != null
        //         ? COLOR_PALETTE[poseId % 20]
        //         : "White";
        ctx.lineWidth = 2;

        poseDetection.util
            .getAdjacentPairs(poseDetection.SupportedModels.MoveNet)
            .forEach(([i, j]) => {
                const kp1 = keypoints[i];
                const kp2 = keypoints[j];

                // If score is null, just show the keypoint.
                const score1 = kp1.score != null ? kp1.score : 1;
                const score2 = kp2.score != null ? kp2.score : 1;
                const scoreThreshold = 0.3;

                if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
                    ctx.beginPath();
                    ctx.moveTo(kp1.x, kp1.y);
                    ctx.lineTo(kp2.x, kp2.y);
                    ctx.stroke();
                }
            });
    }

    onMount(() => {
        mounted = true;
        if (tfjsReady) {
            TFJSReadyAndMounted();
        }

        /*navigator.mediaDevices
			.enumerateDevices()
			.then(function (devices) {
				console.table(devices);
				devices.forEach(function (device) {
					console.log(
						device.kind +
							": " +
							device.label +
							" id = " +
							device.deviceId
					);
				});
			})
			.catch(function (err) {
				console.log(err.name + ": " + err.message);
			});*/
    });

    onDestroy(() => {
        cancelAnimationFrame(frame);
    });

    let tfjs_num_loaded = 0;
    function loadTFJS() {
        tfjs_num_loaded++;

        if (tfjs_num_loaded == 4) {
            tfjsReady = true;
            if (mounted) {
                TFJSReadyAndMounted();
            }
        }
    }

    function TFJSReadyAndMounted() {
        loaded();
        runPosenet();
    }
</script>

<svelte:head>
    <script
        defer
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@3.9.0/dist/tf-core.min.js"
        on:load={loadTFJS}></script>
    <script
        defer
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@3.9.0/dist/tf-converter.min.js"
        on:load={loadTFJS}></script>
    <script
        defer
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@3.9.0/dist/tf-backend-webgl.min.js"
        on:load={loadTFJS}></script>
    <script
        defer
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@0.0.6/dist/pose-detection.min.js"
        on:load={loadTFJS}></script>
</svelte:head>

<button on:click={() => (movenetStarted = !movenetStarted)}>
    {#if movenetStarted}
        Stop MoveNet
    {:else}
        Start MoveNet
    {/if}
</button>

<button on:click={() => TestCompareGroups()}>Test Compare Groups</button>