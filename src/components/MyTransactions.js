import React, { useEffect, useState } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import {useSelector} from "react-redux";
import {decorateOrder, ETHER_ADDRESS, GREEN, RED} from "../helpers";


function MyTransactions ({filledOrders, openOrders, subscribeToCancelEvent}) {
    const {account, exchange} = useSelector(state => state.web3)
    const [myFilledOrders , setMyFilledOrders] = useState([])
    const [myOpenOrders , setMyOpenOrders] = useState([])
    const [loading , setLoading] = useState(false)

    const creatingMyFilledOrders = (account,filledOrders) =>{
        let orders;

        //find our filled orders
        orders = filledOrders.filter(order => order.user === account || order.userFill === account)
        //sort by date ascending
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)
        //decorate order - add display attributes
        orders = decorateMyFilledOrders(orders,account)

        setMyFilledOrders(orders)
    }

    const decorateMyFilledOrders = (orders, account) =>{
        return(
            orders.map(order =>{
                order = decorateOrder(order)
                order = decorateMyFilledOrder(order,account)
                return(order)
            })
        )
    }

    const decorateMyFilledOrder = (order,account)=>{
        const myOrder = order.user === account;

        let orderType
        if(myOrder){
            orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell';
        }else {
            orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy';
        }

        return({
            ...order,
            orderType,
            orderTypeClass : (orderType === 'buy' ? GREEN : RED),
            orderSign: (orderType === 'buy' ? '+' : '-')
        })
    }

    const creatingMyOpenOrders = (account, openOrders) =>{
        let orders;

        //find our open orders
        orders = openOrders.filter(order => order.user === account)
        //sort by date ascending
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)
        //decorate order - add display attributes
        orders = decorateMyOpenOrders(orders)

        setMyOpenOrders(orders)
    }

    const decorateMyOpenOrders = (orders) =>{
        return(
            orders.map(order =>{
                order = decorateOrder(order)
                order = decorateMyOpenOrder(order)
                return(order)
            })
        )
    }

    const decorateMyOpenOrder = (order) =>{
        let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell';
        return({
            ...order,
            orderType,
            orderTypeClass : (orderType === 'buy' ? GREEN : RED),
        })
    }


    useEffect(() =>{
        if(openOrders.length >0){
            creatingMyFilledOrders(account, filledOrders)
            creatingMyOpenOrders(account, openOrders)
        }
    },[openOrders, filledOrders.length])



    const showMyFilledOrders = (myFilledOrders) => {
        return(
            <tbody>
            { myFilledOrders.map((order) => {
                return (
                    <tr key={order.id}>
                        <td className="text-muted">{order.formattedTimestamp}</td>
                        <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
                        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                    </tr>
                )
            }) }
            </tbody>
        )
    }

    const showMyOpenOrders = (myOpenOrders) => {
        return(
            <tbody>
            { myOpenOrders.map((order) => {
                return (
                    <tr key={order.id}>
                        <td className={`text-${order.orderTypeClass}`}>{order.tokenAmount}</td>
                        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                        <td
                            className="text-muted cancel-order"
                            onClick={(e) => {
                                exchange.methods.cancelOrder(order.id).send({from: account})
                                    .on('transactionHash', hash =>{
                                        setLoading(true)
                                        subscribeToCancelEvent()
                                        setLoading(false)
                                    })
                                    .on('error', error =>{
                                        console.log(error);
                                        window.alert('There was an error')
                                    })
                            }}
                        >X</td>
                    </tr>
                )
            }) }
            </tbody>
        )
    }

        return (
            <div className="card bg-dark text-white">
                <div className="card-header">
                    My Transactions
                </div>
                <div className="card-body">
                    <Tabs defaultActiveKey="trades" className="bg-dark text-white">
                        <Tab eventKey="trades" title="Trades" className="bg-dark">
                            <table className="table table-dark table-sm small">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>DAPP</th>
                                        <th>DAPP/ETH</th>
                                    </tr>
                                </thead>
                                {myFilledOrders.length > 0 ? showMyFilledOrders(myFilledOrders)
                                    : loading? <Spinner type="table" /> :<caption>no transaction yet</caption>
                                }
                            </table>
                        </Tab>
                        <Tab eventKey="orders" title="Orders">
                            <table className="table table-dark table-sm small">
                                <thead>
                                <tr>
                                    <th>Amount</th>
                                    <th>DAPP/ETH</th>
                                    <th>Cancel</th>
                                </tr>
                                </thead>
                                { (myOpenOrders.length > 0 && !loading)?
                                    showMyOpenOrders(myOpenOrders)
                                    : loading? <Spinner type="table" /> :<caption>no transaction yet</caption>}
                            </table>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )

}



export default MyTransactions;










