import '@tensorflow/tfjs-core';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

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