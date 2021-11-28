import TFJS from '../tensorflow/TFJS';

export function drawKeypointsAndSkeleton(ctx, keypoints, threshold) {
    if (keypoints) {
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'white';
        drawSkeleton(keypoints, ctx);
        drawKeypoints(keypoints, ctx);
    }
}

/**
 * Draw the keypoints on the video.
 * @param keypoints A list of keypoints.
 */
function drawKeypoints(keypoints, ctx) {
    const keypointInd = TFJS.poseDetection.util.getKeypointIndexBySide(
        TFJS.poseDetection.SupportedModels.MoveNet
    );
    ctx.lineWidth = 4;

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
    if (!keypoint) {
        return;
    }
    
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = 0.3;

    // if (score >= scoreThreshold) {
        // const circle = new Path2D();
        // circle.arc(keypoint.x, keypoint.y, 2, 0, 2 * Math.PI);
        // ctx.fill(circle);
        // ctx.stroke(circle);
    // }
    const size = 16;
    ctx.fillRect(keypoint.x - size / 2, keypoint.y - size / 2, size, size);
    ctx.strokeRect(keypoint.x - size / 2, keypoint.y - size / 2, size, size);
}

/**
 * Draw the skeleton of a body on the video.
 * @param keypoints A list of keypoints.
 */
function drawSkeleton(keypoints, ctx) {
    ctx.lineWidth = 4;

    TFJS.poseDetection.util
        .getAdjacentPairs(TFJS.poseDetection.SupportedModels.MoveNet)
        .forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            
            if (kp1 && kp2) {
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
            }
            
        });
}
