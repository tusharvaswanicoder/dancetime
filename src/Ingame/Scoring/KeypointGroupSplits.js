export const GROUP_TYPE = 
{
    Head: "HEAD",
    Torso: "TORSO",
    Legs: "LEGS"
}

// Index references from here: https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/README.md#pose-estimation
const KP_NAME_TO_GROUP_TYPE =
{
    "nose": GROUP_TYPE.Head,
    "left_eye": GROUP_TYPE.Head,
    "right_eye": GROUP_TYPE.Head,
    "left_ear": GROUP_TYPE.Head,
    "right_ear": GROUP_TYPE.Head,
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

export function SplitPoseByGroupXY(pose)
{
    const split_groups = {};
    for (let i = 0; i < pose.length; i++)
    {
        const keypoint = pose[i];
        const group = KP_NAME_TO_GROUP_TYPE[keypoint.name];
        if (!split_groups[group])
        {
            split_groups[group] = [];
        }
        split_groups[group].push(keypoint);
    }
    
    return split_groups;
}