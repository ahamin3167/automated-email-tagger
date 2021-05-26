import React from 'react'
import { Component } from 'react'
import axios from "axios"
import {Pie, Doughnut, Line} from 'react-chartjs-2';
import {Button} from "@material-ui/core"

class LengthsDataChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stats: {},
            chartData: {},
            lengthsArray: [],
            lengthsData: {},
            statelengthResponse: [],
            statelengthProfessional: [],
            statelengthPersonal: [],
            statelengthNegative: [],
            statelengthNeutral: [],
            statelengthPositive: [],
        }
    }

    render () {
        let lengths = []; // x axis for the email length plot
        let lengthsResponse = [];
        let lengthsProfessional = [];
        let lengthsPersonal = [];
        let lengthsNegative = [];
        let lengthsNeutral = [];
        let lengthsPositive = [];

        const analytics = async () => {
            let str = await axios.get("http://localhost:8000/getanalytics/").then(result => result.data);
            this.setState({stats: str});
            this.setState({lengthsData: str["length_data"]});
            lengths = Object.keys(this.state.lengthsData);
            this.setState({ lengthsArray: lengths });

            var b;
            for (b = 0; b < lengths.length; b++) {
                lengthsResponse[b] = this.state.lengthsData[lengths[b]]["response"];
                lengthsProfessional[b] = this.state.lengthsData[lengths[b]]["professional"];
                lengthsPersonal[b] = this.state.lengthsData[lengths[b]]["personal"];
                lengthsNegative[b] = this.state.lengthsData[lengths[b]]["negative"];
                lengthsNeutral[b] = this.state.lengthsData[lengths[b]]["neutral"];
                lengthsPositive[b] = this.state.lengthsData[lengths[b]]["positive"];
            }

            this.setState({ statelengthResponse: lengthsResponse });
            this.setState({ statelengthProfessional: lengthsProfessional });
            this.setState({ statelengthPersonal: lengthsPersonal });
            this.setState({ statelengthNegative: lengthsNegative });
            this.setState({ statelengthNeutral: lengthsNeutral });
            this.setState({ statelengthPositive: lengthsPositive });

            console.log(this.state.statelengthResponse);
        }

        const theLengthsData = {
            labels: this.state.lengthsArray,
            datasets: [
              {
                label: "Respond",
                data: this.state.statelengthResponse,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "red"
              },
              {
                label: "Professional",
                data: this.state.statelengthProfessional,
                fill: false,
                borderColor: "#C9DE00"
              },
              {
                label: "Personal",
                data: this.state.statelengthPersonal,
                fill: false,
                borderColor: "#2FDE00"
              },
              {
                label: "Negative",
                data: this.state.statelengthNegative,
                fill: false,
                borderColor: "#00A6B4"
              },
              {
                label: "Neutral",
                data: this.state.statelengthNeutral,
                fill: false,
                borderColor: "#6800B4"
              },
              {
                label: "Positive",
                data: this.state.statelengthPositive,
                fill: false,
                borderColor: "black"
              }
            ]
        };
         
        return (
            <div className="insights">
                <Button onClick={() => analytics()}>
                    Email Length Analytics
                </Button>

                <Line data={theLengthsData}
                        options={{
                            title:{
                            display:true,
                            text:'Ratio of Each Type of Emails',
                            fontSize:20
                            },
                            maintainAspectRatio: true,
                            legend:{
                            display:true,
                            position:'right'
                            }
                        }} 
                />       


            </div>
        );
    }
}

export default LengthsDataChart;