import React, {useState, useEffect} from 'react';
import * as io from "socket.io-client";
import "../styles/app.scss"

import {isWebVersion} from "./constants/isWebVersion";

export default class App extends React.Component {

    constructor (props)
    {
        super(props);
        this.state = 
        {
        }
    }

    render () {
        return (
            <>
                <div className={`background`}></div>
            </>
        )
    }
}