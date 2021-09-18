<script>
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import { cameraStore, cameraCanvasStore } from "./stores.js";
    const dispatch = createEventDispatcher();
    const loaded = () => dispatch("tfjs-loaded");

    let mounted = false;
    let tfjsReady = false;
    let frame;
    let detector;

    let movenetStarted = false;
    let ctx;
    $: ctx = $cameraCanvasStore && $cameraCanvasStore.getContext("2d");

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
            console.log(poses);

            if (ctx) {
                for (const pose of poses) {
                    drawCanvas(pose, pose);
                }
            }
        }
        
        frame = requestAnimationFrame(detect);
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

    function drawCanvas(pose) {
        if (pose.keypoints != null) {
            pose.keypoints_normalized =
                poseDetection.calculators.keypointsToNormalizedKeypoints(
                    pose.keypoints,
                    { width: $cameraStore.videoWidth, height: $cameraStore.videoHeight }
                );
            pose.keypoints = normalizedKeypointsToVideoSize(pose.keypoints_normalized, $cameraStore)
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

    /**
     * Draw the keypoints on the video.
     * @param keypoints A list of keypoints.
     */
    function drawKeypoints(keypoints) {
        const keypointInd = poseDetection.util.getKeypointIndexBySide(
            poseDetection.SupportedModels.MoveNet
        );
        ctx.fillStyle = "Red";
        ctx.strokeStyle = "White";
        ctx.lineWidth = 2;

        for (const i of keypointInd.middle) {
            drawKeypoint(keypoints[i]);
        }

        ctx.fillStyle = "Green";
        for (const i of keypointInd.left) {
            drawKeypoint(keypoints[i]);
        }

        ctx.fillStyle = "Orange";
        for (const i of keypointInd.right) {
            drawKeypoint(keypoints[i]);
        }
    }

    function drawKeypoint(keypoint) {
        // If score is null, just show the keypoint.
        const score = keypoint.score != null ? keypoint.score : 1;
        const scoreThreshold = 0.3;

        if (score >= scoreThreshold) {
            const circle = new Path2D();
            circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
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
        const color = "White";
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
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
                    console.log("path");
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
