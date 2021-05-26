import React from 'react'
import { Component } from 'react'
import axios from "axios"
import {Pie, Doughnut} from 'react-chartjs-2';
import {Button} from "@material-ui/core"

class TotalDataChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stats: {},
            totalData: {},
            chartData: {},
            totalDataNums: []
        }
    }

    render () {
        let totalData = [];
        const analytics = async () => {
            let str = await axios.get("http://localhost:8000/getanalytics/").then(result => result.data);
            this.setState({stats: str});
            this.setState({totalData: str["total_data"]});
            totalData[0] = this.state.totalData["response"];
            totalData[1] = this.state.totalData["professional"];
            totalData[2] = this.state.totalData["personal"];
            totalData[3] = this.state.totalData["negative"];
            totalData[4] = this.state.totalData["neutral"];
            totalData[5] = this.state.totalData["positive"];

            this.setState({ totalDataNums: totalData });
            console.log(this.state.totalDataNums);
        }

        const theTotalData = {
            labels: ['response', 'professional', 'personal',
                     'negative', 'neutral', 'positive'],
            datasets: [
              {
                label: 'Type of Email',
                backgroundColor: [
                  '#B21F00',
                  '#C9DE00',
                  '#2FDE00',
                  '#00A6B4',
                  '#6800B4',
                  'grey'
                ],
                hoverBackgroundColor: [
                '#501800',
                '#4B5000',
                '#175000',
                '#003350',
                '#35014F',
                'black'
                ],
                data: this.state.totalDataNums
              }
            ]
        }
 
        //use a pie chart for the total data
         
        return (
            <div className="insights">
                <Button onClick={() => analytics()}>
                    Total Data Analytics
                </Button>

                <div className="pie_chart"> 
                    <Pie
                        data={theTotalData}
                        options={{
                            title:{
                            display:true,
                            text:'Ratio of Each Type of Emails',
                            fontSize:20
                            },
                            maintainAspectRatio: false,
                            legend:{
                            display:true,
                            position:'right'
                            }
                        }}
                    />
                </div>   

            </div>
        );
    }
}

export default TotalDataChart