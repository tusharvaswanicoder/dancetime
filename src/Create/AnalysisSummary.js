import {
    ConvertDurationToNiceStringWithDecimal,
    GetRoundedTimeFromTime
} from '../utils';

export const PROBLEM_TYPE = {
    AVG_KEYPOINT_FREQUENCY: 'Average Keypoint Frequency', // Avg # of frames between keypoints
    MISSING_KEYPOINTS: 'Missing Keypoints', // Specifically missing some out of the 17 keypoints on specific frames
    KEYPOINT_SPACING: 'Keypoint Spacing', // There is a period of frames where the gap between keypoint frames is too large
    KEYPOINT_SCORE_THRESHOLD: 'Keypoint Score Threshold',
};

export const SEVERITY = {
    NONE: 'None',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
};

// TODO: take Video in/out points into consideration
// FUTURE TODO: take scoring areas into consideration
export const GetAnalysisSummary = (project, keypoint_score_threshold) => {
    return [
        GetAvgKeypointFrequency(project),
        // ...GetKeypointsUnderScoreThreshold(project, keypoint_score_threshold),
    ];
};

// Gets the percentage of frames that do not have keypoints (at all) on them
// Too many missing frames upgrades the severity as the scoring will be less accurate
// And if there are way too many missing frames, then it cannot be published (sev too high)
// TODO: make this dependent on FPS
const GetAvgKeypointFrequency = (project) => {
    // Get all frames with _will_ be used for scoring
    const total_scoring_time = project.duration;
    let num_frames_with_keypoints = Object.keys(project.keypoints).length;
    const keypoints_percent = total_scoring_time / num_frames_with_keypoints;
    const one_per_x_kp = Math.ceil(1 / keypoints_percent);

    const frame_severities = [
        { percent: 0.05, sev: SEVERITY.NONE },
        { percent: 0.1, sev: SEVERITY.LOW },
        { percent: 0.2, sev: SEVERITY.MEDIUM },
        { percent: 0.4, sev: SEVERITY.HIGH },
    ];

    let severity = SEVERITY.NONE;

    for (let sev_data of frame_severities) {
        if (keypoints_percent <= sev_data.percent) {
            severity = sev_data.sev;
            break;
        } else if (sev_data.sev == SEVERITY.HIGH) {
            severity = SEVERITY.HIGH;
        }
    }

    return {
        title: PROBLEM_TYPE.AVG_KEYPOINT_FREQUENCY,
        message: `Every second has an average of ${one_per_x_kp} frame${one_per_x_kp == 1 ? '' : 's'} with keypoint data.`,
        severity: severity,
        impact: `Having less frames with keypoint data per second will decrease the accuracy of scoring.`,
        resolution: `Re-run Automatic Analysis with a lower Video Playback Rate. Make sure to keep this tab open while analyzing for best results.`,
    };
};

const GetKeypointsUnderScoreThreshold = (project, keypoint_score_threshold) => {
    const groups = []; // Groups of consecutive keypoints under threshold

    let current_group = {};
    for (const keypoint_data of Object.entries(project.keypoints)) {
        const [frame, keypoint] = keypoint_data;

        // If keypoint score is below threshold, add to current consecutive group
        if (keypoint.score < keypoint_score_threshold) {
            current_group[frame] = keypoint;
        } else if (Object.keys(current_group).length > 0) {
            // Otherwise, if there are any keypoints in the current consecutive group, add to groups list
            groups.push(current_group);
            current_group = {};
        }
    }

    const frame_severities = [
        { max_frames: project.fps / 15, sev: SEVERITY.NONE },
        { max_frames: project.fps / 7, sev: SEVERITY.LOW },
        { max_frames: project.fps / 4, sev: SEVERITY.MEDIUM },
        { max_frames: project.fps / 3, sev: SEVERITY.HIGH },
    ];

    return groups.map((group) => {
        const group_keys = Object.keys(group).map((key) => parseInt(key));
        const max_frame = group_keys.reduce((prev, cur) => prev > cur ? prev : cur);
        const min_frame = group_keys.reduce((prev, cur) => prev < cur ? prev : cur);
        const start_time = ConvertDurationToNiceStringWithDecimal(
            xx(min_frame, project.fps)
        );
        const end_time = ConvertDurationToNiceStringWithDecimal(
            xx(max_frame, project.fps)
        );
        
        let severity = SEVERITY.NONE;

        for (let sev_data of frame_severities) {
            if (group_keys.length <= sev_data.max_frames) {
                severity = sev_data.sev;
                break;
            } else if (sev_data.sev == SEVERITY.HIGH) {
                severity = SEVERITY.HIGH;
            }
        }
        
        return {
            title: PROBLEM_TYPE.KEYPOINT_SCORE_THRESHOLD,
            message: `${start_time} to ${end_time} has ${group_keys.length} keypoints under the score threshold.`,
            severity: severity,
            impact: `Having keypoints under the score threshold means that the automatically generated keypoints might not be accurate, and will negatively affect the scoring accuracy.`,
            resolution: `Manual action required. Use a Scoring Areas component to disable scoring in this area or manually align the keypoints to the expected positions.`,
        };
    });
};

const GetKeypointSpacingProblems = (project) => {
    // Get all frames with _will_ be used for scoring
    const total_scoring_frames = xx(
        project.duration,
        project.fps
    );
    let num_frames_with_keypoints = Object.keys(keypoints).length;
    const keypoints_percent = num_frames_with_keypoints / total_scoring_frames;
    const one_per_x_kp = Math.ceil(1 / keypoints_percent);

    const frame_severities = [
        { max_frames: project.fps / 10, sev: SEVERITY.NONE },
        { max_frames: project.fps / 7, sev: SEVERITY.LOW },
        { max_frames: project.fps / 4, sev: SEVERITY.MEDIUM },
        { max_frames: project.fps / 3, sev: SEVERITY.HIGH },
    ];

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
        resolution: `Re-run Automatic Analysis with a lower Video Playback Rate. Make sure to keep this tab open while analyzing for best results.`,
    };
};
