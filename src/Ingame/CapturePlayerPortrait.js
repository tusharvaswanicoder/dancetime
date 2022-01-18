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