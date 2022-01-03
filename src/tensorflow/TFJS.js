import '@tensorflow/tfjs-core';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-core/dist/public/chained_ops/register_all_chained_ops';


// 2.7s+ hot reload time with TFJS installed. Can be potentially minifier further with: 
// https://www.tensorflow.org/js/tutorials/deployment/size_optimized_bundles

class TFJS {
    constructor () {
        this.modelTypes = {...poseDetection.movenet.modelType};
        this.modelType = this.modelTypes.SINGLEPOSE_LIGHTNING;
        this.initialized = false;
        this.poseDetection = poseDetection;
    }
    
    async initialize (_modelType, minPoseScore) {
        // Default to SINGLEPOSE_LIGHTNING model type if none was provided
        const modelType = _modelType || this.modelTypes.SINGLEPOSE_LIGHTNING;

        // Already initialized and model type has not changed, so just reset the detector
        if (this.initialized && modelType == this.modelType) {
            this.detector.reset();
            return;
        }

        // If an old detector exists, dispose of it and make a new one
        if (this.detector) {
            this.detector = this.detector.dispose();
        }
        
        console.log(`using modelType: ${modelType}`)
        this.modelType = modelType;
        const detectorConfig = {
            modelType
        }

        // Enable person tracking for multipose
        if (modelType == this.modelTypes.MULTIPOSE_LIGHTNING) {
            detectorConfig.enableTracking = true;
            detectorConfig.trackerType = poseDetection.TrackerType.BoundingBox;
            detectorConfig.trackerConfig = {
                maxTracks: 20,
                maxAge: 60 * 1000,
                minSimilarity: 0.1,
                // keypointTrackerParams: {
                //     keypointConfidenceThreshold: 0.4,
                //     minNumberOfKeypoints: 10
                // }
            }
            // Potentially use detectorConfig.trackerConfig
            // https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/src/calculators/tracker.md
        }

        if (minPoseScore) {
            detectorConfig.minPoseScore = minPoseScore;
        }

        console.log(`Creating detector with config:`)
        console.log(detectorConfig);

        this.detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            detectorConfig
        );

        this.initialized = true;
    }
    
    async detectFrame (source) {
        if (!this.initialized) {
            await this.initialize();
        }
    
        const poses = await this.detector.estimatePoses(source);
        return poses;
    }
}

const tfjs = new TFJS();
export default tfjs;