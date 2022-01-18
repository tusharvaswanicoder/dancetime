export const GROUP_TYPE = 
{
    // Head: "HEAD",
    Torso: "TORSO",
    Legs: "LEGS"
}

// Index references from here: https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/README.md#pose-estimation
const KP_NAME_TO_GROUP_TYPE =
{
    // "nose": GROUP_TYPE.Head,
    // "left_eye": GROUP_TYPE.Head,
    // "right_eye": GROUP_TYPE.Head,
    // "left_ear": GROUP_TYPE.Head,
    // "right_ear": GROUP_TYPE.Head,
    "left_shoulder": GROUP_TYPE.Torso,
    "right_shoulder": GROUP_TYPE.Torso,
    "left_elbow": GROUP_TYPE.Torso,
    "right_elbow": GROUP_TYPE.Torso,
    "left_wrist": GROUP_TYPE.Torso,
    "right_wrist": GROUP_TYPE.Torso,
    "left_hip": GROUP_TYPE.Legs,
    "right_hip": GROUP_TYPE.Legs,
    "left_knee": GROUP_TYPE.Legs,
    "right_knee": GROUP_TYPE.Legs,
    "left_ankle": GROUP_TYPE.Legs,
    "right_ankle": GROUP_TYPE.Legs,
}

const KP_NAME_TO_ORDER = 
{
    // "nose": 2,
    // "left_eye": 1,
    // "right_eye": 3,
    // "left_ear": 0,
    // "right_ear": 4,
    "left_shoulder": 2,
    "right_shoulder": 3,
    "left_elbow": 1,
    "right_elbow": 4,
    "left_wrist": 0,
    "right_wrist": 5,
    "left_hip": 2,
    "right_hip": 3,
    "left_knee": 1,
    "right_knee": 4,
    "left_ankle": 0,
    "right_ankle": 5,
}

const KP_NAME_TO_ORDER2 = 
{
    "nose": 0,
    "left_eye": 1,
    "right_eye": 2,
    "left_ear": 3,
    "right_ear": 4,
    "left_shoulder": 5,
    "right_shoulder": 6,
    "left_elbow": 7,
    "right_elbow": 8,
    "left_wrist": 9,
    "right_wrist": 10,
    "left_hip": 11,
    "right_hip": 12,
    "left_knee": 13,
    "right_knee": 14,
    "left_ankle": 15,
    "right_ankle": 16,
}

export const SortKeypointsByName = (keypoints) => {
    return keypoints.sort((a, b) => KP_NAME_TO_ORDER2[a.name] - KP_NAME_TO_ORDER2[b.name])
}

// Sort split groups to ensure ordering of points is the same
const SortSplitGroups = (split_groups) => {
    for (const group_name in split_groups) {
        let group = split_groups[group_name];
        group = group.sort((a, b) => KP_NAME_TO_ORDER[a.name] - KP_NAME_TO_ORDER[b.name])
        split_groups[group_name] = group;
    }
    
    return split_groups;
}

export function SplitPoseByGroupXY(pose)
{
    const split_groups = {};
    for (let i = 0; i < pose.length; i++)
    {
        const keypoint = pose[i];
        const group = KP_NAME_TO_GROUP_TYPE[keypoint.name];
        
        if (typeof group != 'undefined') {
            if (!split_groups[group])
            {
                split_groups[group] = [];
            }
            split_groups[group].push(keypoint);
        }
    }
    
    // return SortSplitGroups(split_groups);
    return split_groups;
}