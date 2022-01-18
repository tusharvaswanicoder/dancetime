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
        
        this.modelType = modelType;
        const detectorConfig = {
            modelType
        }

        // Enable person tracking for multipose
        if (modelType == this.modelTypes.MULTIPOSE_LIGHTNING) {
            detectorConfig.enableTracking = true;
            detectorConfig.trackerType = poseDetection.TrackerType.Keypoint;
            detectorConfig.trackerConfig = {
                maxTracks: 50,
                maxAge: 9999999,
                minSimilarity: 0.01,
                keypointTrackerParams: {
                    keypointConfidenceThreshold: 0.1, // Default 0.3
                    minNumberOfKeypoints: 10, // Minimum keypoints needed - omit face
                    keypointFalloff: [ // Default
                        0.026, 0.025, 0.025, 0.035, 0.035, 0.079, 0.079, 0.072, 0.072, 0.062,
                        0.062, 0.107, 0.107, 0.087, 0.087, 0.089, 0.089
                    ]
                }
            }
            // Potentially use detectorConfig.trackerConfig
            // https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/src/calculators/tracker.md
        }

        if (minPoseScore) {
            detectorConfig.minPoseScore = minPoseScore;
        }

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