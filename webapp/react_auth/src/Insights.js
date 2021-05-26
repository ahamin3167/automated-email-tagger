import React from 'react'
import { IconButton } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { useHistory } from 'react-router'
import { Component } from 'react'
import axios from "axios"
import {Button} from "@material-ui/core"
import { lime } from '@material-ui/core/colors'
import {Pie, Doughnut, Line} from 'react-chartjs-2';
import "./Insights.css"
import "./TotalDataChart"
import TotalDataChart from './TotalDataChart'
import LengthsDataChart from './LengthsDataChart'
import DaysAgoChart from './DaysAgoChart'
// import { useHistory } from 'react-router'

function Insights() {
        const history = useHistory();
        return (
            <div className="insights">
                <IconButton onClick = {()=>history.push("/")}><ArrowBackIcon/> Back to Main Page</IconButton>
                <div className="piechart">
                    <TotalDataChart/>
                    <DaysAgoChart/>
                    <LengthsDataChart/> 
                </div>
                
            </div>
        );
    }

export default Insights