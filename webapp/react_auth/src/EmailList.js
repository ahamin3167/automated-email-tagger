import React, { useEffect, useState } from 'react'
import './EmailList.css'
import EmailRow from './EmailRow'
import axios from "axios"
import { useHistory } from 'react-router'
import {Button} from "@material-ui/core"

function EmailList() {
    const [items, getEmails] = useState([]);
    // console.log(data);
    const emails = async () => {
        let str = await axios.get("http://localhost:8000/getemails/").then(result => result.data);
        // let str = await axios.get("http://localhost:8000/getsortedemails/").then(result => result.data);
        // console.log(str);
        return str;
    }

    // const getSortedEmails = async () => {
    //     let str = await axios.get("http://localhost:8000/getsortedemails/").then(result => result.data);
    //     console.log(str);
    // }

    useEffect(() => {
        emails().then(data => getEmails(data));
    }, []);

    const history = useHistory();
    return (
        <div>
            <Button onClick={() => history.push("/insights")}>
                    Analytics
            </Button>

            <Button onClick={() => history.push("/sorted")}>
                    Personalized Inbox
            </Button>

            <Button onClick={() => history.push("/queried")}>
                    Your Query
            </Button>

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
    )
}

export default EmailList