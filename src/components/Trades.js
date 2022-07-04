import React,{useState, useEffect} from "react";
import { decorateOrder,RED,GREEN} from "../helpers";
import Spinner from "./Spinner";

function Trade({rawFilledOrders}){

    const[decoratedFilledOrders,setDecoratedFilledOrders] = useState([])

    const decoratingOrders = rawFilledOrders =>{
        let orders;
        // sort orders by date ascending for price comparison
        orders = rawFilledOrders.sort((a,b) => a.timestamp - b.timestamp)

        orders = decorateFilledOrders(orders)

        //sort orders by date descending for display
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)

        setDecoratedFilledOrders(orders)

    }

    const decorateFilledOrders = orders =>{
        let previousOrder = orders[0] //track previous order to compare history
        return(
            orders.map(order => {
                order = decorateOrder(order)
                order = decorateFilledOrder(order, previousOrder)
                previousOrder = order // update previous order once it's decorated
                return order
            })
        )
    }

    const decorateFilledOrder = (order, previousOrder) =>{
        return({
            ...order,
            tokenPriceClass : tokenPriceClass(order.tokenPrice, order.id, previousOrder)
        })
    }

    // show green price if order price higher than previous order
    // show red price if order price lower than previous order
    const tokenPriceClass =(tokenPrice, orderId, previousOrder) =>{
        // show green price if only one order exist
        if(previousOrder.id === orderId){
            return GREEN
        }

        if(previousOrder.tokenPrice <= tokenPrice){
            return GREEN // success
        }else {
            return RED // danger
        }
    }

    useEffect(() =>{
        decoratingOrders(rawFilledOrders)
    },[rawFilledOrders])

    
    return(
        <div className="vertical">
            <div className="card bg-dark text-white">
                <div className="card-header">
                    Trades
                </div>
                <div className="card-body">
                    <table className="table table-dark table-sm small">
                        <thead>
                        <tr>
                            <th scope="col">Time</th>
                            <th scope="col">DAPP</th>
                            <th scope="col">DAPP/ETH</th>
                        </tr>
                        </thead>
                        <tbody>
                        {decoratedFilledOrders?
                            decoratedFilledOrders.map(order =>{
                                return(
                                    <tr key={order.id}>
                                        <th className='text-muted'>{order.formattedTimestamp}</th>
                                        <th >{order.tokenAmount}</th>
                                        <th className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</th>
                                    </tr>
                                )
                            })
                            :<Spinner type={'table'}/>
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    )
}

export default Trade;