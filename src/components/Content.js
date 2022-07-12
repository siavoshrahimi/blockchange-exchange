import React,{useEffect,useState} from "react";
import Trade from "./Trades";
import OrderBook from "./OrderBook";
import MyTransactions from "./MyTransactions";
import {reject,findIndex} from "lodash";
import PriceChart from "./PriceChart";
import Balance from "./Balance";

function Content({exchange}) {


    const [cancelledOrders,setCancelOrders]= useState([])
    const [filledOrders,setFilledOrders]= useState([])
    const [orders,setOrders]= useState([])

    const loadAllOrders = async exchange =>{
        //fetch cancelled orders with "Cancel" event stream
        let cancelStream =await exchange.getPastEvents('Cancel',{fromBlock:0, toBlock:'latest'})
        //format cancelled orders
        setCancelOrders( cancelStream.map(event => event.returnValues))


        //fetch filled orders with "Trade" event stream
        let tradeStream =await exchange.getPastEvents('Trade',{fromBlock:0, toBlock:'latest'})
        //format filled orders
        setFilledOrders( tradeStream.map(event => event.returnValues))


        //fetch all orders with "Order" event stream
        let orderStream =await exchange.getPastEvents('Order',{fromBlock:0, toBlock:'latest'})
        //format all orders
        setOrders( orderStream.map(event => event.returnValues))

    }

    useEffect( async ()=>{
        await loadAllOrders(exchange)
    },[exchange])

    //take out open orders from filled and cancelled orders
    const openOrders = reject(orders, order =>{
        const orderFilled = filledOrders.some(o => o.id === order.id)
        const orderCancelled = cancelledOrders.some(o => o.id === order.id)
        return (orderFilled || orderCancelled)
    })

    //subscribe to cancel event
    const subscribeToCancelEvent = () => exchange.events.Cancel({}, (error, event) =>{
        setCancelOrders([...cancelledOrders, event.returnValues])
    })

    const subscribeToTradeEvent = () => exchange.events.Trade({}, (error, event) =>{
        const newFilledOrder = event.returnValues
        //prevent an order filled twice
        let index = filledOrders.findIndex(order => order.id === newFilledOrder.id)
        if(index === -1){
            setFilledOrders([...filledOrders, newFilledOrder])
        }else {
            setFilledOrders([...filledOrders])
        }

    })

    return(
        <div className="content">
            <div className="vertical-split">
                <Balance/>
                <div className="card bg-dark text-white">
                    <div className="card-header">
                        Card Title
                    </div>
                    <div className="card-body">
                        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        <a href="/#" className="card-link">Card link</a>
                    </div>
                </div>
            </div>
            <OrderBook rawOpenOrders={openOrders} subscribeToTradeEvent={subscribeToTradeEvent} filledOrders={filledOrders}/>
            <div className="vertical-split">
                <PriceChart filledOrders={filledOrders}/>
                <MyTransactions filledOrders={filledOrders} openOrders={openOrders} subscribeToCancelEvent={subscribeToCancelEvent}/>
            </div>
            <Trade rawFilledOrders={filledOrders}/>
        </div>
    )
}

export default Content;