import {Button} from "@material-ui/core"
import React, { useEffect, useState } from 'react'
import axios from "axios"
import EmailRow from './EmailRow'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { IconButton } from '@material-ui/core'
import { useHistory } from 'react-router'

function Queried({queryData}) {
    const history = useHistory();

    const [items, getEmails] = useState([]);

    useEffect(() => {
        getEmails(queryData.query)
    }, []);

    return (
        <div className = "queriedEmails">
            <IconButton onClick = {()=>history.push("/")}><ArrowBackIcon/> Back to Main Page</IconButton>
            <Button onClick={() => getEmails(queryData.query)}> Get Query </Button>
            {/* <Button onClick={() => console.log(items)}> get items </Button> */}

            <div className="emailList"> 
                
                {items.map((email) => {
                    return (
                        <EmailRow
                            id = {email.email_id}
                            sender = {email.email_sender}
                            subject = {email.email_subject}
                            description = {email.email_body}
                            time = {email.email_date}
                            responsetag = {email.tags.response_tag}
                            personaltag = {email.tags.personal_tag}
                            sentimenttag = {email.tags.sentiment_tag}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default Queried;