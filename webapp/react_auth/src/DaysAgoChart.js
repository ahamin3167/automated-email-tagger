import React from 'react'
import { Component } from 'react'
import axios from "axios"
import {Pie, Doughnut, Line} from 'react-chartjs-2';
import {Button} from "@material-ui/core"

class DaysAgoChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stats: {},
            dateData: {},
            chartData: {},
            daysAgoArray: [],
            statedaysResponse: [],
            statedaysProfessional: [],
            statedaysPersonal: [],
            statedaysNegative: [],
            statedaysNeutral: [],
            statedaysPositive: [],

        }
    }

    render () {
        let daysAgo = []; //x axis for time plot
        let daysResponse = [];
        let daysProfessional = [];
        let daysPersonal = [];
        let daysNegative = [];
        let daysNeutral = [];
        let daysPositive = [];

        const analytics = async () => {
            let str = await axios.get("http://localhost:8000/getanalytics/").then(result => result.data);
            this.setState({stats: str});
            this.setState({dateData: str["date_data"]});
            daysAgo = Object.keys(this.state.dateData);
            this.setState({ daysAgoArray: daysAgo });

            var a;
            for (a = 0; a < daysAgo.length; a++) {
                daysResponse[a] = this.state.dateData[daysAgo[a]]["response"];
                daysProfessional[a] = this.state.dateData[daysAgo[a]]["professional"];
                daysPersonal[a] = this.state.dateData[daysAgo[a]]["personal"];
                daysNegative[a] = this.state.dateData[daysAgo[a]]["negative"];
                daysNeutral[a] = this.state.dateData[daysAgo[a]]["neutral"];
                daysPositive[a] = this.state.dateData[daysAgo[a]]["positive"];
            }

            this.setState({ statedaysResponse: daysResponse });
            this.setState({ statedaysProfessional: daysProfessional });
            this.setState({ statedaysPersonal: daysPersonal });
            this.setState({ statedaysNegative: daysNegative });
            this.setState({ statedaysNeutral: daysNeutral });
            this.setState({ statedaysPositive: daysPositive });

            console.log(this.state.statedaysNegative);
        }

        const theDaysAgoData = {
            labels: this.state.daysAgoArray,
            datasets: [
              {
                label: "Respond",
                data: this.state.statedaysResponse,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "red"
              },
              {
                label: "Professional",
                data: this.state.statedaysProfessional,
                fill: false,
                borderColor: "#C9DE00"
              },
              {
                label: "Personal",
                data: this.state.statedaysPersonal,
                fill: false,
                borderColor: "#2FDE00"
              },
              {
                label: "Negative",
                data: this.state.statedaysNegative,
                fill: false,
                borderColor: "#00A6B4"
              },
              {
                label: "Neutral",
                data: this.state.statedaysNeutral,
                fill: false,
                borderColor: "#6800B4"
              },
              {
                label: "Positive",
                data: this.state.statedaysPositive,
                fill: false,
                borderColor: "black"
              }
            ]
        };
         
        return (
            <div className="insights">
                <Button onClick={() => analytics()}>
                    Time Analytics
                </Button>

                <Line data={theDaysAgoData}
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

export default DaysAgoChart