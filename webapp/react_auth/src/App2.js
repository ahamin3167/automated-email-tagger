import React, { Component } from 'react';
import GoogleLogin from 'react-google-login';
import googleLogin from "./services/googleLogin"
import axios from "axios"
import './App.css';

class App extends Component {

  render() {
    const data = require('./credentials.json');


    const responseGoogle = async (response) => {
      let googleResponse  = await googleLogin(response.accessToken);
      console.log(googleResponse);
      console.log(response);
      let temp = await axios.put("http://localhost:8000/updatecreds/", response).then(result=>result.data);
    }

    const plswork = async () => {
      let str = await axios.get("http://localhost:8000/testend1/").then(result => result.data);
      console.log(str);
    }

    const emails = async () => {
      let str = await axios.get("http://localhost:8000/getemails/").then(result => result.data);
      console.log(str);
    }

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

    const analytics = async () => {
      let str = await axios.get("http://localhost:8000/getanalytics/").then(result => result.data);
      console.log(str);
    }

    const shiftWeights = async (emailID, thumb) => {
      let str = await axios.put("http://localhost:8000/shiftweights/", {email_id:emailID, reaction:thumb}).then(result => result.data); // need to be able to change email id and reaction being pushed to backend based upon which email the the person clicked on
      console.log(str);
    }

    const getSortedEmails = async () => {
      let str = await axios.get("http://localhost:8000/getsortedemails/").then(result => result.data);
      console.log(str);
    }

    return (
      <div className="App">
        <h1>LOGIN WITH FACEBOOK AND GOOGLE</h1>

        <GoogleLogin
          clientId={data["web"]["client_id"]}
          buttonText="LOGIN WITH GOOGLE"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
        />

        <button onClick={() => plswork()}>
          Button
        </button>

        <button onClick={() => emails()}>
          Emails
        </button>

        <button onClick={() => query(false, false, true, false, false, false)}>
          Query
        </button>

        <button onClick={() => analytics()}>
          Analytics
        </button>

        <button onClick={() => shiftWeights("178f5ce2f350d17f", "thumbs_up")}>
          Shift Weights
        </button>

        <button onClick={() => getSortedEmails()}>
          Sorted Emails
        </button>

      </div>
    );
  }
}

export default App;
