import '@tensorflow/tfjs-core';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-core/dist/public/chained_ops/register_all_chained_ops';


// 2.7s hot reload time with TFJS installed. Can be potentially minifier further with: 
// https://www.tensorflow.org/js/tutorials/deployment/size_optimized_bundles

class TFJS {
    constructor () {
        this.initialized = false;
        this.poseDetection = poseDetection;
        this.initialize();
    }
    
    async initialize () {
        if (this.initialized) {
            return;
        }
        
        this.detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        
        this.initialized = true;
    }
    
    async detectFrame (source) {
        if (!this.initialized) {
            await this.initialize();
        }
    
        const poses = await this.detector.estimatePoses(source);
        return poses[0];
    }
}

const tfjs = new TFJS();
export default tfjs;