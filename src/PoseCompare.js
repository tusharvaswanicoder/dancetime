import { Matrix, solve } from 'ml-matrix';

const GROUP_TYPE = 
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

function SplitPoseByGroup(pose)
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
        split_groups[group].push([keypoint.x, keypoint.y]);
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
        if (!split_groups[group])
        {
            split_groups[group] = [];
        }
        split_groups[group].push(keypoint);
    }
    
    return split_groups;
}

// var X = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
// var y = Matrix.columnVector([8, 20, 32]);
// var b = solve(X, y, (useSVD = true));

function CreateFilledArray(size, value)
{
    const a = new Array(size);
    for (let i = 0; i < size; i++)
    {
        a[i] = value;
    }
    return a;
}

function pad(matrix)
{
    const m = new Matrix(matrix);
    m.addColumn(m.columns, CreateFilledArray(m.rows, 1));
    m.addRow(m.rows, CreateFilledArray(m.columns, 1));
    return m;
}

function unpad(matrix)
{
    const m = new Matrix(matrix);
    m.removeColumn(m.columns - 1);
    m.removeRow(m.rows - 1);
    return m;
}

// function ApplyAffineTransformationMatrix(matrix, input_features)
// {
//     const m = new Matrix(matrix);
//     const X = pad(input_features);
//     const Y = X.mmul(m);
//     return unpad(Y);
// }

// function PoseCompare(model_features, input_features, threshold)
// {
//     const m = FindAffineTransformationMatrix(model_features, input_features);
//     const Y = ApplyAffineTransformationMatrix(m, input_features);
//     const error = Y.sub(input_features);
//     const error_norm = error.norm();
//     return error_norm < threshold;
// }

// export { PoseCompare };

// 1  -7.48
// 0.00211   1

// perfect match:
/*
0.5 0.5
0.5 0.5


a b
c d

Math.atan2(c, d) * (180/Math.PI) = degrees of rotation 

it goes higher/lower depending on how far it is

    | a  b  tx |
A = | c  d  ty |
    | 0  0  1  |
    Thus set the traslation into [dx, dy]=[tx, ty]
    The scale is sx = sqrt(a² + c²) and sy = sqrt(b² + d²)
    The rotation angle is t = atan(c/d) or t = atan(-b/a) as also they should be the same.
    
    
    
    
*/

// 0: Float64Array(3) [ 0.5259633725115298, 0.04288557580168706, 0 ]
// ​​
// 1: Float64Array(3) [ 0.12110502957427394, 0.4825409177340681, 0 ]
// ​​
// 2: Float64Array(3) [ 0.08656929900423, 0.15245618075993866, 1.0000000000000004 ]

function transform(matrix, affine_matrix)
{
    const m = new Matrix(matrix);
    const X = pad(m);
    const Y = X.mmul(affine_matrix);
    return unpad(Y);
}

function GetRotationAngleFromAffineMatrix(affine_matrix)
{
    const a = affine_matrix.get(1, 0);
    const c = affine_matrix.get(1, 1);
    return (Math.atan2(a, c) * (180/Math.PI)) - 45
}

/**
 * Compares two poses from TFJS.
 * @param {array} model 
 * @param {array} input 
 */
export function ComparePoses(_model, _input)
{
    const model_split_groups = SplitPoseByGroup(_model);
    const input_split_groups = SplitPoseByGroup(_input);
    
    const compared_groups = ComparePoseGroups(model_split_groups, input_split_groups);
    console.log(compared_groups);
    
    return compared_groups
}

function ComparePoseGroups(model_groups, input_groups)
{
    if (Object.keys(model_groups).length !== Object.keys(input_groups).length)
    {
        console.error("model_groups length does not match input_groups length")
        return;
    }
    
    const compared_groups = {};
    
    for (const group_type in model_groups)
    {
        compared_groups[group_type] = ComparePoseGroup(model_groups[group_type], input_groups[group_type]);
    }
    
    return compared_groups;
}

function ComparePoseGroup(model_group, input_group)
{
    const model = new Matrix(model_group);
    const input = new Matrix(input_group);
    
    const affine = FindAffineTransformationMatrix(model, input);
    const input_transformed = transform(input, affine);
    const rotation = GetRotationAngleFromAffineMatrix(affine);
    
    return {
        affine: affine,
        input_transformed: input_transformed,
        rotation: rotation
    }
}

function FindAffineTransformationMatrix(model_features, input_features)
{
    // Pad with 1s on the right side and bottom
    const X = pad(model_features);
    const Y = pad(input_features);
    console.log(X)
    console.log(Y)
    
    const b = solve(X, Y, true).transpose();
    b.apply((row, col) => 
    {
        let value = b.get(row, col);
        // Set small values to 0
        b.set(row, col, Math.abs(value) < 1e-10 ? 0 : value.toFixed(5));
    })
    console.log(b);
    
    return b;
}