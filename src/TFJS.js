import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tfc from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

// 2.7s hot reload time with TFJS installed. Can be potentially minifier further with: 
// https://www.tensorflow.org/js/tutorials/deployment/size_optimized_bundles

console.log(poseDetection);
console.log(tfc);

