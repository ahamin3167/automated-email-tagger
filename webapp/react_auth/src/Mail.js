import { IconButton } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { selectOpenMail } from './features/counter/mailSlice'
import './Mail.css'

function Mail({id, sender, subject, description, time}) {
    const history = useHistory();
    // const selectedMail = useSelector(selectOpenMail);
    return (
        <div className="mail">
            <div className="mail__tools">
                <div className="mail__toolsleft">
                    <IconButton onClick = {()=>history.push("/")}><ArrowBackIcon/></IconButton>
                </div>
                <div className="mail__toolsright">
                </div>
            </div>
            <div className="mail__body">
                <div className="mail__bodyHeader">
                    <h2> {subject} </h2>
                    <p>{sender}</p>
                    <p className="mail__time">{time}</p>
                </div>
                <div className="mail__message">
                    <p>{description}</p>
                </div>
            </div>
        </div>
    )
}

export default Mail