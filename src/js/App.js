import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import "../styles/app.scss"
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import Webcam from "react-webcam";
import * as params from './params';

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
        this.cameraRef = React.createRef();
        this.canvasRef = React.createRef();
    }
    //  Load posenet
    async runPosenet() {
        const detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet, 
            {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING});

        const fps = 60;
        const interval = 1000 / fps;

        setInterval(() => {
            this.detect(detector);
        }, interval);
    }

    async detect(detector) {
        if (
            typeof this.cameraRef.current !== "undefined" &&
            this.cameraRef.current !== null &&
            this.cameraRef.current.video.readyState === 4
        ) {
            // Get Video Properties
            const video = this.cameraRef.current.video;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            // Make Detections
            const poses = await detector.estimatePoses(video);
            console.log(poses);

            this.drawCanvas(poses[0], videoWidth, videoHeight, this.canvasRef);
        }
    };
    drawCanvas(pose, videoWidth, videoHeight, canvas) {
        const ctx = canvas.current.getContext("2d");
        canvas.current.width = videoWidth;
        canvas.current.height = videoHeight;

        this.ctx = ctx;
        this.drawKeypoints(pose["keypoints"]);
        this.drawSkeleton(pose["keypoints"]);
    }

    /**
     * Draw the keypoints on the video.
     * @param keypoints A list of keypoints.
     */
    drawKeypoints(keypoints) {
        const keypointInd =
            poseDetection.util.getKeypointIndexBySide(params.STATE.model);
        this.ctx.fillStyle = 'Red';
        this.ctx.strokeStyle = 'White';
        this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

        for (const i of keypointInd.middle) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = 'Green';
        for (const i of keypointInd.left) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = 'Orange';
        for (const i of keypointInd.right) {
            this.drawKeypoint(keypoints[i]);
        }
    }

    drawKeypoint(keypoint) {
        // If score is null, just show the keypoint.
        const score = keypoint.score != null ? keypoint.score : 1;
        const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

        if (score >= scoreThreshold) {
            const circle = new Path2D();
            circle.arc(keypoint.x, keypoint.y, params.DEFAULT_RADIUS, 0, 2 * Math.PI);
            this.ctx.fill(circle);
            this.ctx.stroke(circle);
        }
    }

    /**
     * Draw the skeleton of a body on the video.
     * @param keypoints A list of keypoints.
     */
    drawSkeleton(keypoints, poseId) {
        // Each poseId is mapped to a color in the color palette.
        const color = params.STATE.modelConfig.enableTracking && poseId != null ?
            COLOR_PALETTE[poseId % 20] :
            'White';
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

        poseDetection.util.getAdjacentPairs(params.STATE.model).forEach(([
            i, j
        ]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];

            // If score is null, just show the keypoint.
            const score1 = kp1.score != null ? kp1.score : 1;
            const score2 = kp2.score != null ? kp2.score : 1;
            const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

            if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });
    }


    componentDidMount() {
        // this.socket = io(`${window.location.protocol}//${window.location.hostname}:3000`);
        // this.socket.on("connect", () => {
        //     console.log("Connected to server");
        // });

        const maxFPS = 60;
        const interval = 1000 / maxFPS;

        // setInterval(() => {
        //     const poses = await detector.estimatePoses(video);
        //     console.log(poses[0].keypoints);
        // }, interval);
        this.runPosenet()
        // Outputs:
        // [
        //    {x: 230, y: 220, score: 0.9, name: "nose"},
        //    {x: 212, y: 190, score: 0.8, name: "left_eye"},
        //    ...
        // ]
    }

    render() {
        return (
            <>
                <div className={`background`}>
                    <Webcam
                        ref={this.cameraRef}
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: 0,
                            right: 0,
                            textAlign: "center",
                            zindex: 9,
                            width: 640,
                            height: 480,
                        }}
                    />
                    <canvas
                        ref={this.canvasRef}
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: 0,
                            right: 0,
                            textAlign: "center",
                            zindex: 9,
                            width: 640,
                            height: 480,
                        }}
                    />
                </div>
            </>
        )
    }
}