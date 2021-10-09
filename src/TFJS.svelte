<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import {
        cameraStore,
        cameraCanvasStore,
        cameraStoreVideo,
        cameraCanvasStoreVideo,
    } from './stores.js';
    const dispatch = createEventDispatcher();
    const loaded = () => dispatch('tfjs-loaded');

    import { SplitPoseByGroupXY } from './PoseCompare.js';
    import { shapeSimilarity } from 'curve-matcher';

    let mounted = false;
    let tfjsReady = false;
    let frame;
    let detector;

    let movenetStarted = false;
    let ctxcam;
    let ctxvideo;
    $: ctxcam = $cameraCanvasStore && $cameraCanvasStore.getContext('2d');
    $: ctxvideo =
        $cameraCanvasStoreVideo && $cameraCanvasStoreVideo.getContext('2d');

    async function runPosenet() {
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        detect();
    }

    async function detect() {
        if (ctxcam) {
            clearCanvas(ctxcam);
        }

        if (ctxvideo) {
            clearCanvas(ctxvideo);
        }

        if (
            $cameraStore &&
            $cameraStore.readyState == 4 &&
            movenetStarted &&
            $cameraStoreVideo &&
            $cameraStoreVideo.readyState == 4
        ) {
            // Get Video Properties
            // Make Detections
            const poses = await detector.estimatePoses($cameraStore);
            const poses_ref = await detector.estimatePoses($cameraStoreVideo);
            $cameraStoreVideo.playbackRate = 0.5;

            if (ctxcam && ctxvideo) {
                if (poses.length == 1) {
                    drawCanvas(poses[0], 'Red', $cameraStore, ctxcam);
                }

                if (poses_ref.length == 1) {
                    drawCanvas(
                        poses_ref[0],
                        'Green',
                        $cameraStoreVideo,
                        ctxvideo
                    );
                }

                if (poses.length > 0 && poses_ref.length > 0) {
                    const pose = poses[0];
                    const pose_ref = poses_ref[0];

                    TestCompareGroupsNew(pose, pose_ref, ctxvideo);
                }
            }
        }

        // drawCanvas(TestKeypoints, "Green");

        frame = requestAnimationFrame(detect);
    }

    function TestCompareGroupsNew(pose, pose_ref, ctx) {
        const groups = SplitPoseByGroupXY(pose.keypoints);
        const model_groups = SplitPoseByGroupXY(pose_ref.keypoints);

        let i = 1;
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
            ctx.font = '24px serif';
            ctx.fillStyle = 'White';
            ctx.strokeStyle = 'White';
            ctx.fillText(`${group_name}: ${similarity.toFixed(2)}`, 0, i * 30);
            i++;
        }
    }

    function clearCanvas(ctx) {
        ctx.clearRect(
            0,
            0,
            $cameraCanvasStore.width,
            $cameraCanvasStore.height
        );
    }

    function drawCanvas(pose, color, store, ctx) {
        if (pose.keypoints != null) {
            if (!pose.keypoints_normalized) {
                pose.keypoints_normalized =
                    poseDetection.calculators.keypointsToNormalizedKeypoints(
                        pose.keypoints,
                        { width: store.videoWidth, height: store.videoHeight }
                    );
            }
            pose.keypoints = normalizedKeypointsToVideoSize(
                pose.keypoints_normalized,
                store
            );
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            drawKeypoints(pose.keypoints, ctx);
            drawSkeleton(pose.keypoints, pose.id, ctx);
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

    function drawKeypointsTransformed(keypoints, group_type) {
        ctx.lineWidth = 0;

        for (let i = 0; i < keypoints.length; i++) {
            drawKeypoint(keypoints[i]);
        }
    }

    /**
     * Draw the keypoints on the video.
     * @param keypoints A list of keypoints.
     */
    function drawKeypoints(keypoints, ctx) {
        const keypointInd = poseDetection.util.getKeypointIndexBySide(
            poseDetection.SupportedModels.MoveNet
        );
        ctx.lineWidth = 2;

        for (const i of keypointInd.middle) {
            drawKeypoint(keypoints[i], i, ctx);
        }

        for (const i of keypointInd.left) {
            drawKeypoint(keypoints[i], i, ctx);
        }

        for (const i of keypointInd.right) {
            drawKeypoint(keypoints[i], i, ctx);
        }
    }

    function drawKeypoint(keypoint, i, ctx) {
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
    function drawSkeleton(keypoints, poseId, ctx) {
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