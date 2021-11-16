import { GetFrameNumberFromTime } from '../utils';

export const PROBLEM_TYPE = {
    AVG_KEYPOINT_FREQUENCY: 'Average Keypoint Frequency', // Avg # of frames between keypoints
    MISSING_KEYPOINTS: 'Missing Keypoints', // Specifically missing some out of the 17 keypoints on specific frames
    KEYPOINT_SPACING: 'Keypoint Spacing' // There is a period of frames where the gap between keypoint frames is too large
}

export const SEVERITY = {
    NONE: 'None',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High'
}

export const GetAnalysisSummary = (project, keypoints) => {
    return [
        GetAvgKeypointFrequency(project, keypoints)
    ]
}

// Gets the percentage of frames that do not have keypoints (at all) on them
// Too many missing frames upgrades the severity as the scoring will be less accurate
// And if there are way too many missing frames, then it cannot be published (sev too high)
// TODO: make this dependent on FPS
const GetAvgKeypointFrequency = (project, keypoints) => {
    // Get all frames with _will_ be used for scoring
    const total_scoring_frames = GetFrameNumberFromTime(project.duration, project.fps);
    let num_frames_with_keypoints = Object.keys(keypoints).length;
    const keypoints_percent = num_frames_with_keypoints / total_scoring_frames;
    const one_per_x_kp = Math.ceil(1 / keypoints_percent);
    
    const frame_severities = [
        {max_frames: project.fps / 10, sev: SEVERITY.NONE},
        {max_frames: project.fps / 7, sev: SEVERITY.LOW},
        {max_frames: project.fps / 4, sev: SEVERITY.MEDIUM},
        {max_frames: project.fps / 3, sev: SEVERITY.HIGH}
    ]
    
    let severity = SEVERITY.NONE;
    
    for (let sev_data of frame_severities) {
        if (one_per_x_kp <= sev_data.max_frames) {
            severity = sev_data.sev;
            break;
        } else if (sev_data.sev == SEVERITY.HIGH) {
            severity = SEVERITY.HIGH;
        }
    }
    
    return {
        title: PROBLEM_TYPE.AVG_KEYPOINT_FREQUENCY,
        message: `1 out of every ${one_per_x_kp} frames has keypoint data.`,
        severity: severity,
        impact: `Having a larger gap between frames with keypoint data will decrease accuracy of scoring.`,
        resolution: `Re-run Automatic Analysis with a lower Video Playback Rate. Make sure to keep this tab open while analyzing.`
    }
}