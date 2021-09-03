import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import "../styles/app.scss"
import * as poseDetection from '@tensorflow-models/pose-detection';

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            videoSrc: "",
        }
    }

    componentDidMount() {
        this.socket = io(`${window.location.protocol}//${window.location.hostname}:3000`);
        this.socket.on("connect", () => {
            console.log("Connected to server");
        });

        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
        // const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER});

        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia ||
            navigator.oGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({ video: true }, this.handleVideo, this.videoError);
        }

        setInterval(() => {
            const poses = await detector.estimatePoses(video);
            console.log(poses[0].keypoints);
        }, 100);

        // Outputs:
        // [
        //    {x: 230, y: 220, score: 0.9, name: "nose"},
        //    {x: 212, y: 190, score: 0.8, name: "left_eye"},
        //    ...
        // ]
    }

    handleVideo(stream) {
        // Update the state, triggering the component to re-render with the correct stream
        this.setState({ videoSrc: window.URL.createObjectURL(stream) });
    }

    videoError() {

    }

    render() {
        return (
            <>
                <div className={`background`}>
                    <video autoplay="true" src={this.state.videoSrc} />
                </div>
            </>
        )
    }
}