import React, { useState, useRef } from "react";
import { useHistory } from 'react-router'
import './EmailRow.css'
import {useDispatch, Provider} from 'react-redux'
import { selectMail } from './features/counter/mailSlice';
import Mail from './Mail';
import {Button} from "@material-ui/core"
import Accordion from 'react-bootstrap/Accordion'
import EmailBody from "./EmailBody";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import axios from "axios"


function EmailRow({id, sender, subject, description, time, responsetag, personaltag, sentimenttag}) {
    const history = useHistory();

    const shiftWeights = async (emailID, thumb) => {
        let str = await axios.put("http://localhost:8000/shiftweights/", {email_id:emailID, reaction:thumb}).then(result => result.data); // need to be able to change email id and reaction being pushed to backend based upon which email the the person clicked on
        console.log(str);
    }

    let weightsData = {
        email_id: id,
        reaction: ""
    };

    const handleThumbsUp = async (emailID, thumb) => {
        weightsData.email_id = emailID;
        weightsData.reaction = thumb   
        let str = await axios.put("http://localhost:8000/shiftweights/", weightsData).then(result => result.data);
        console.log(weightsData);
    }

    const handleThumbsDown = async (emailID, thumb) => {
        weightsData.email_id = emailID;
        weightsData.reaction = thumb
        let str = await axios.put("http://localhost:8000/shiftweights/", weightsData).then(result => result.data);
        console.log(weightsData);
    }

    var tags = sentimenttag;

    time = time.substring(0, 16);


    if (personaltag == "True") {
        tags += ", Personal"
    } else {
        tags += ", Professional"
    }

    if (responsetag == "True"){
        tags += ", Response"
    }

    return (
        <div className="emailRow">
            <div className="main">
                <div onClick={() => handleThumbsDown(id, "thumbs_down")}>
                    <ThumbDownIcon/>
                </div>
                <div onClick={() => handleThumbsUp(id, "thumbs_up")}>
                    <ThumbUpIcon/>
                </div>
                
                <div className="emailrow__title">
                    <h3>{sender}</h3>
                </div>
                <div className="emailrow__message">
                    <h4>
                        {subject}
                    </h4>
                </div> 

                <div className="emailrow__tags">
                    <h5>
                        {tags}
                    </h5>   
                </div> 

                <p className="emailrow__time">
                    {time}
                </p>
            </div>
            <div className= "emailrow__body">
                <EmailBody description = {description}/>
            </div>
        </div>

    )
}

export default EmailRow
