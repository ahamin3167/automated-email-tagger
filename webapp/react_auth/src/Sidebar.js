import React from 'react'
import "./Sidebar.css"
import {Button} from "@material-ui/core"
// import AddIcon from '@material-ui/icons/Add';
import { useHistory } from 'react-router'
import "./Insights.js"
import Checkbox from '@material-ui/core/Checkbox';
import { Component } from 'react';
import axios from "axios"
import Queried from './Queried'

class Sidebar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            "Professional": false,
            "Personal": false,
            "Positive": false,
            "Negative": false,
            "Neutral": false,
            "Respond": false,
            "MinLength": -1,
            "MaxLength": -1,
            "StartDate": null,
            "EndDate": null,
            "query": []
        }

        // this.onChangeMinLength = this.onChangeMinLength.bind(this);
    }

    onChangeProfessional = () => {
        this.setState(initialState => ({
          "Professional": !initialState.Professional,
        }));
    }

    onChangePersonal = () => {
        this.setState(initialState => ({
          "Personal": !initialState.Personal,
        }));
    }

    onChangePositive = () => {
        this.setState(initialState => ({
          "Positive": !initialState.Positive,
        }));
    }

    onChangeNegative = () => {
        this.setState(initialState => ({
          "Negative": !initialState.Negative,
        }));
    }

    onChangeNeutral = () => {
        this.setState(initialState => ({
          "Neutral": !initialState.Neutral,
        }));
    }

    onChangeRespond = () => {
        this.setState(initialState => ({
          "Respond": !initialState.Respond,
        }));
    }

    // onChangeMinLength(event) {
    //     if(event.target.value > -1){
    //         this.setState(initialState => ({
    //             "MinLength" : event.target.value,
    //           }));
    //     }
    // }

    changeMinLength = e => {
        this.setState({
            ...this.state,
            ["MinLength"]: e.target.value
        });
    }

    changeMaxLength = e => {
        this.setState({
            ...this.state,
            ["MaxLength"]: e.target.value
        });
    }

    changeStartDate = e => {
        this.setState({
            ...this.state,
            ["StartDate"]: e.target.value
        });
    }

    changeEndDate = e => {
        this.setState({
            ...this.state,
            ["EndDate"]: e.target.value
        });
    }
    
    // // Submit Query
    // onSubmit = async (list_for_query) => {      
    //     let str = await axios.put("http://localhost:8000/queryemails/", this.state).then(result => result.data); // need to be able to change the dict being pushed to the backend based upon user input
    //     // this.setState({query: str});
    //     console.log(str);
    //     console.log(this.state)
    // }

    query = async () => {  
        var sendDict = {};
        sendDict['Personal'] = this.state.Personal;
        sendDict['Professional'] = this.state.Professional;
        sendDict['Neutral'] = this.state.Neutral;
        sendDict['Negative'] = this.state.Negative;
        sendDict['Positive'] = this.state.Positive;
        sendDict['Respond'] = this.state.Respond;
        sendDict['StartDate'] = this.state.StartDate;
        sendDict['MinLength'] = this.state.MinLength;
        sendDict['MaxLength'] = this.state.MaxLength;
        sendDict['EndDate'] = this.state.EndDate;
        let str = await axios.put("http://localhost:8000/queryemails/", sendDict).then(result => result.data); // need to be able to change the dict being pushed to the backend based upon user input
        // heh = str;
        this.setState({ query: str });
        console.log(str);
        // console.log(this.state.query);
        // console.log(sendDict);
        // console.log(heh);
        return str;
    }

    render() {
        // const history = useHistory();
        return (
            <div>
            <div className="sidebar">
                <Checkbox disabled={this.state.Personal} checked={this.state.Professional} onChange={this.onChangeProfessional} className="sidebar-professional">
                </Checkbox>
                
                <p>Professional</p>
                
                <Checkbox disabled={this.state.Professional} checked={this.state.Personal} onChange={this.onChangePersonal} className="sidebar-personal">
                    Personal
                </Checkbox>
                
                <p>Personal</p>
                
                <Checkbox disabled={this.state.Negative || this.state.Neutral} checked={this.state.Positive} onChange={this.onChangePositive} className="sidebar-positive">
                    Positive
                </Checkbox>
                
                <p>Positive</p>
                
                <Checkbox disabled={this.state.Positive || this.state.Neutral} checked={this.state.Negative} onChange={this.onChangeNegative} className="sidebar-negative">
                    Negative
                </Checkbox> 
                
                <p>Negative</p>

                <Checkbox disabled={this.state.Positive || this.state.Negative} checked={this.state.Neutral} onChange={this.onChangeNeutral} className="sidebar-neutral">
                    Neutral
                </Checkbox> 
                
                <p>Neutral</p>

                <Checkbox checked={this.state.Respond} onChange={this.onChangeRespond} className="sidebar-negative">
                    Respond
                </Checkbox> 
                
                <p>Respond</p>

                <input type="number" placeholder="Minimum Email Length" id="MinLength" onChange={this.changeMinLength}>

                </input>

                <input type="number" placeholder="Maximum Email Length" id="MaxLength" onChange={this.changeMaxLength}>

                </input>

                <p>Start Date: </p>
                <input type="date" placeholder="Start Date" id="StartDate" onChange={this.changeStartDate}>
                    
                </input>

                <p>End Date: </p>
                <input type="date" placeholder="End Date" id="EndDate" onChange={this.changeEndDate}>
                    
                </input>


                {/* <Button onClick={this.onSubmit}>Submit Query</Button> */}

                
            </div>
            <div>
                <Button onClick={()=>this.query()}> Submit Query </Button>
                <Queried queryData={this.state}/>
            </div>
            

            </div>
        )
    }
}

export default Sidebar