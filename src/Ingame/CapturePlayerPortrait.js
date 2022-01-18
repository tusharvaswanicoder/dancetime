import { drawImageProp } from "../utils";

const GetHeadSizeFromPose = (pose) => {
    const left_ear_keypoint = pose.keypoints.find((kp) => kp.name == 'left_ear');
    const right_ear_keypoint = pose.keypoints.find((kp) => kp.name == 'right_ear');
    const head_width = left_ear_keypoint.x - right_ear_keypoint.x;
    return {x: head_width, y: head_width};
}

const GetHeadCenterPosition = (pose) => {
    return pose.keypoints.find((kp) => kp.name == 'nose');
}

export const GetPlayerPortrait = (videoElement, pose) => {
    if (pose.score < 0.5) {
        return;
    }
    
    const canvas = document.createElement('canvas'); // create a canvas
    canvas.style.display = 'none';
    const ctx = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const head_center = GetHeadCenterPosition(pose);
    
    const head_size = GetHeadSizeFromPose(pose);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    const head_size_scale_factor = 250;
    const scale = 1 / Math.abs(head_size.x) * head_size_scale_factor;
    
    // Something is probably wrong, try again later to get it
    const percent_border = 0.15;
    if (scale > 10 || 
        head_center.x / canvas.width < percent_border || 
        head_center.x / canvas.width > (1 - percent_border) || 
        head_center.y / canvas.height < percent_border || 
        head_center.y / canvas.height > (1 - percent_border)) {
        canvas.remove();
        return;
    }
    
    ctx.scale(scale, scale);
    ctx.translate(-head_center.x, -head_center.y - head_size.y / 2);
    drawImageProp(ctx, videoElement);
    
    return new Promise((resolve, reject) => {
        canvas.toBlob(resolve, 'image/jpeg'); // request a Blob from the canvas
        canvas.remove();
    });
}

// {
//     "keypoints": [
//       {
//         "y": 390.94244241714483,
//         "x": 1461.9894790649414,
//         "score": 0.4330351650714874,
//         "name": "nose"
//       },
//       {
//         "y": 386.4445209503174,
//         "x": 1466.052017211914,
//         "score": 0.45821982622146606,
//         "name": "left_eye"
//       },
//       {
//         "y": 387.57158517837524,
//         "x": 1449.9746704101562,
//         "score": 0.5440286993980408,
//         "name": "right_eye"
//       },
//       {
//         "y": 396.949589252472,
//         "x": 1463.1927108764648,
//         "score": 0.45952871441841125,
//         "name": "left_ear"
//       },
//       {
//         "y": 392.71842241287237,
//         "x": 1431.4960098266602,
//         "score": 0.5986655950546265,
//         "name": "right_ear"
//       },
//       {
//         "y": 449.6895074844361,
//         "x": 1485.981330871582,
//         "score": 0.6217039823532104,
//         "name": "left_shoulder"
//       },
//       {
//         "y": 444.5032596588135,
//         "x": 1393.648681640625,
//         "score": 0.6448729038238525,
//         "name": "right_shoulder"
//       },
//       {
//         "y": 414.6544218063355,
//         "x": 1534.998779296875,
//         "score": 0.7083321213722229,
//         "name": "left_elbow"
//       },
//       {
//         "y": 373.85451793670654,
//         "x": 1379.5338821411133,
//         "score": 0.7506795525550842,
//         "name": "right_elbow"
//       },
//       {
//         "y": 354.31294441223145,
//         "x": 1550.6158447265625,
//         "score": 0.5566864609718323,
//         "name": "left_wrist"
//       },
//       {
//         "y": 324.1925239562988,
//         "x": 1445.2491760253906,
//         "score": 0.38920414447784424,
//         "name": "right_wrist"
//       },
//       {
//         "y": 596.4094877243043,
//         "x": 1490.4618072509766,
//         "score": 0.6790080070495605,
//         "name": "left_hip"
//       },
//       {
//         "y": 609.9096536636354,
//         "x": 1428.6863708496094,
//         "score": 0.8274864554405212,
//         "name": "right_hip"
//       },
//       {
//         "y": 705.0815105438232,
//         "x": 1575.0011444091797,
//         "score": 0.8087323307991028,
//         "name": "left_knee"
//       },
//       {
//         "y": 759.5116853713989,
//         "x": 1441.8953704833984,
//         "score": 0.5414826273918152,
//         "name": "right_knee"
//       },
//       {
//         "y": 842.8372621536255,
//         "x": 1535.76416015625,
//         "score": 0.5682965517044067,
//         "name": "left_ankle"
//       },
//       {
//         "y": 865.6194448471069,
//         "x": 1431.3029479980469,
//         "score": 0.6686024069786072,
//         "name": "right_ankle"
//       }
//     ],
//     "box": {
//       "yMin": 0.2500475347042084,
//       "xMin": 0.7115248441696167,
//       "yMax": 0.757706344127655,
//       "xMax": 0.8341208696365356,
//       "width": 0.12259602546691895,
//       "height": 0.5076588094234467
//     },
//     "score": 0.5276540517807007,
//     "id": 3,
//     "player_id": 3
//   }