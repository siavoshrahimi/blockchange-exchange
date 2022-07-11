import React,{useEffect,useState} from "react";
import  ReactApexChart from 'react-apexcharts';
import {chartOptions, dummyData} from "./priceChart.config";
import {decorateOrder} from "../helpers";
import {groupBy, maxBy, minBy, get} from 'lodash'
import moment from "moment";
import Spinner from "./Spinner";



function PriceChart({filledOrders}) {
    const [chartData, setChartData] = useState({})

    const creatingPriceChart = filledOrders =>{
        let orders;
        //sort orders by ascending date
        orders = filledOrders.sort((a,b) => a.timestamp - b.timestamp)
        //decorate orders
        orders = orders.map(order => decorateOrder(order))
        //get last 2 orders for final price and price change
        let secondLastOrder, lastOrder
        [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
        const lastPrice = get(lastOrder, 'tokenPrice', 0);
        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0);

        setChartData({
            lastPrice,
            lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
            series:[{
                data:buildGraphData(orders)
            }]
        })
    }

    const buildGraphData =orders =>{
        //group orders by the hour for the graph
        orders = groupBy(orders, order => moment.unix(order.timestamp).startOf('hour').format())
        //get each hour where data exists
        const hour = Object.keys(orders)
        //build the graph series
        return hour.map(hour =>{
            // fetch all orders from the current hour
            const group = orders[hour]
            // calculate price values, open , high,low and close
            const open = group[0] // first order
            const high = maxBy(group, 'tokenPrice') // high price
            const low = minBy(group, 'tokenPrice') // low price
            const close = group[group.length - 1] //last order
            return({
                x:new Date(hour),
                y:[open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
            })
        })
       
    }

    useEffect(() =>{

        filledOrders.length > 0 && creatingPriceChart(filledOrders)
    },[filledOrders])

    const priceSymbol = lastPriceChange =>{
        let output
        if(lastPriceChange === '+'){
            output = <span className='text-success'> &#9650;</span> // green up triangle
        }else {
            output = <span className='text-danger'> &#9660;</span> //red down triangle
        }
        return output
    }

    const showPriceChart = priceChart =>{
        return(
            <div className='price-chart'>
                <div className="price">
                    DAPP/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}
                </div>
                <ReactApexChart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='85%'/>
            </div>
        )
    }

    return(
        <div className='card bg-dark text-white'>
            <div className="card-header">
                Price Chart
            </div>
            <div className="card-body">
                {chartData.hasOwnProperty('series')  ? showPriceChart(chartData) : < Spinner/>}
            </div>

        </div>
    )
}

export default PriceChart;