import React, { Component, useEffect, useState } from 'react';
import GoogleLogin from 'react-google-login';
import googleLogin from "./services/googleLogin"
import axios from "axios"
import './App.css';
import Sidebar from './Sidebar';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import Mail from './Mail';
import EmailList from './EmailList';
import Insights from "./Insights"
import {Button} from "@material-ui/core"
import { Provider } from 'react-redux'
import {createStore, combineReducers} from 'redux';
import "./TotalDataChart";
import TotalDataChart from './TotalDataChart';
import { useHistory } from 'react-router'
import SortedEmails from "./SortedEmails"
import Queried from './Queried';

function App() {
  // constructor(props) {
  //   super(props)
  //   this.state = {
  //       stats: {}
  //   }
  // }

//  render() {
    const history = useHistory();
    const data = require('./credentials.json');
    let resp = {};

    const responseGoogle = async (response) => {
      let googleResponse  = await googleLogin(response.accessToken);
      console.log(googleResponse);
      console.log(response);
      resp = response;
      let temp = await axios.put("http://localhost:8000/updatecreds/", response).then(result=>result.data);
    }

    // const plswork = async () => {
    //   let str = await axios.get("http://localhost:8000/testend1/").then(result => result.data);
    //   console.log(str);
    // }

    const emails = async () => {
      let str = await axios.get("http://localhost:8000/getemails/").then(result => result.data);
      console.log(str);
      // {str.map( email => {
      //   return(
      //     <EmailRow
      //     sender = {email.email_sender}
      //     subject = {email.email_subject}
      //     description = {email.email_body}
      //     time = {email.email_date}
      //   />
      //   );
      // })}
    }

    // const query = async (list_for_query) => {      
    //   let str = await axios.put("http://localhost:8000/queryemails/", {response:"True", sentiment:"Negative"}).then(result => result.data); // need to be able to change the dict being pushed to the backend based upon user input
    //   console.log(str);
    // }

    const query = async (pers, prof, neutral, negative, positive, response) => {  
      var sendDict = {};
      sendDict['Personal'] = pers;
      sendDict['Professional'] = prof;
      sendDict['Neutral'] = neutral;
      sendDict['Negative'] = negative;
      sendDict['Positive'] = positive;
      sendDict['Respond'] = response;
      // if (pers == true) {
      //   sendDict['Personal'] = "True";
      // }
      // if (response_tag != null) {
      //   sendDict['response'] = response_tag;
      // }
      // if (sentiment_tag != null) {
      //   sendDict['sentiment'] = sentiment_tag;
      // }
      let str = await axios.put("http://localhost:8000/queryemails/", sendDict).then(result => result.data); // need to be able to change the dict being pushed to the backend based upon user input
      console.log(str);
      console.log(sendDict)
    }

    // const analytics = async () => {
    //   let str = await axios.get("http://localhost:8000/getanalytics/").then(result => result.data);
    //   this.setState({stats: str});
    //   console.log(str);
    // }

    // const shiftWeights = async (emailID, thumb) => {
    //   let str = await axios.put("http://localhost:8000/shiftweights/", {email_id:emailID, reaction:thumb}).then(result => result.data); // need to be able to change email id and reaction being pushed to backend based upon which email the the person clicked on
    //   console.log(str);
    // }

    const getSortedEmails = async () => {
      let str = await axios.get("http://localhost:8000/getsortedemails/").then(result => result.data);
      console.log(str);
    }

    // const query = async (list_for_query) => {      
    //   let str = await axios.put("http://localhost:8000/queryemails/", {response:"True", sentiment:"Negative"}).then(result => result.data); // need to be able to change the dict being pushed to the backend based upon user input
    //   console.log(str);
    // }

    return (
      <div className="App">
  
        <h1>Intelligent Email Tagging and Querying</h1>

        <GoogleLogin
          clientId={data["web"]["client_id"]}
          buttonText="LOGIN WITH GOOGLE"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
        />

        {/* <Button onClick={() => emails()}>
          Emails
        </Button>

        <Button onClick={() => query(false, false, false, false, true, false)}>
          Query
        </Button> */}

        {/* <Button onClick={() => shiftWeights("178f5ce2f350d17f", "thumbs_up")}>
          Shift Weights
        </Button> */}

        {/* <Button onClick={() => getSortedEmails()}>
          Sorted Emails
        </Button> */}

        <Router>
          <div className="App">
            <div className="app__body">
              {/* <Sidebar/> */}
              <Switch>
                <Route path="/insights">
                  <Insights/>
                </Route>

                <Route path="/sorted">
                  <SortedEmails/>
                </Route>

                <Route path="/queried">
                  <Sidebar/>
                  {/* <Queried/> */}
                </Route>

                <Route path="/">
                  {/* <Insights/> */}
                  <EmailList/>
                </Route>
              </Switch>
            </div>
          </div>
        </Router>

        {/* <button onClick={() => analytics()}>
          Analytics
        </button>

        <button onClick={() => shiftWeights("178f5ce2f350d17f", "thumbs_up")}>
          Shift Weights
        </button>

        <button onClick={() => getSortedEmails()}>
          Sorted Emails
        </button> */}

      </div>
    );
  }
// }


export default App;

