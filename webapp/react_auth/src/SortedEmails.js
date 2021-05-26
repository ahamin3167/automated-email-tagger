import React, { useEffect, useState } from 'react'
import axios from "axios"
import EmailRow from './EmailRow'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { IconButton } from '@material-ui/core'
import { useHistory } from 'react-router'

function SortedEmails() {
    const history = useHistory();
    const getSortedEmails = async () => {
        let str = await axios.get("http://localhost:8000/getsortedemails/").then(result => result.data);
        console.log(str);
        return str;
    }

    const [items, getEmails] = useState([]);

    useEffect(() => {
        getSortedEmails().then(data => getEmails(data));
    }, []);

    return (
        <div className = "sortedEmails">
            <IconButton onClick = {()=>history.push("/")}><ArrowBackIcon/> Back to Main Page</IconButton>
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

export default SortedEmails;