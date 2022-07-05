import React,{useEffect,useState} from "react";
import Trade from "./Trades";
import OrderBook from "./OrderBook";

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
        //format filled orders
        setOrders( orderStream.map(event => event.returnValues))

    }

    useEffect( async ()=>{
        await loadAllOrders(exchange)
    },[exchange])

    return(
        <div className="content">
            <div className="vertical-split">
                <div className="card bg-dark text-white">
                    <div className="card-header">
                        Card Title
                    </div>
                    <div className="card-body">
                        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        <a href="/#" className="card-link">Card link</a>
                    </div>
                </div>
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
            <OrderBook allOrders={orders} cancelledOrders={cancelledOrders} filledOrders={filledOrders}/>
            <div className="vertical-split">
                <div className="card bg-dark text-white">
                    <div className="card-header">
                        Card Title
                    </div>
                    <div className="card-body">
                        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        <a href="/#" className="card-link">Card link</a>
                    </div>
                </div>
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
            <Trade rawFilledOrders={filledOrders}/>
        </div>
    )
}

export default Content;