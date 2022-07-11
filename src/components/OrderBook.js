import React,{useEffect,useState} from "react";
import {decorateOrder, ETHER_ADDRESS, GREEN, RED} from "../helpers";
import {groupBy} from 'lodash'
import Spinner from "./Spinner";

function OrderBook({ rawOpenOrders}) {

    const [openOrders, setOpenOrders] = useState({})


        const decoratingOpenOrders = (openOrders) =>{
            let orders;
            //Decorate orders
            orders = decorateOrderBookOrders(openOrders)
            //Group orders bye 'orderType'
            orders = groupBy(orders,'orderType')

            //fetch buy orders
            const buyOrders =orders['buy'];
            orders ={
                ...orders,
                buyOrders:buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
            }
            const sellOrders =orders['sell'];
            orders ={
                ...orders,
                sellOrders:sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
            }
            setOpenOrders(orders)
        }

        const decorateOrderBookOrders = openOrders =>{
            return(
                openOrders.map(order =>{
                    order = decorateOrder(order)
                    order = decorateOrderBookOrder(order)
                    return order
                })
            )
        }

        //whether is buy or sell order
        const decorateOrderBookOrder = order =>{
            const orderType = order.tokenGive === ETHER_ADDRESS? 'buy': 'sell'
            return({
                ...order,
                orderType,
                orderTypeClass: (orderType === 'buy' ? GREEN : RED),
                orderFillClass :orderType === 'buy' ? 'sell' : 'buy'
            })
        }

        useEffect(() =>{
            if(rawOpenOrders.length >0 ){
                decoratingOpenOrders(rawOpenOrders)
            }
        },[rawOpenOrders])

    const renderOrder = order =>{
        return(
            <tr key={order.id}>
                <td>{order.tokenAmount}</td>
                <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                <td>{order.etherAmount}</td>
            </tr>
        )
    }


    const showOrderBook = openOrders =>{
        return(
            <tbody>
                {openOrders.sellOrders.map(order => renderOrder(order))}
                <tr>
                    <th scope="col">DAPP</th>
                    <th scope="col">DAPP/ETH</th>
                    <th scope="col">ETH</th>
                </tr>
                {openOrders.buyOrders.map(order => renderOrder(order))}
            </tbody>
        )
    }

    return(
        <div className="vertical">
            <div className="card bg-dark text-white">
                <div className="card-header">
                    Order Book
                </div>
                <div className="card-body">
                    <table className="table table-dark table-sm small">
                        {openOrders.hasOwnProperty('buy')? showOrderBook(openOrders) :<Spinner type='table'/>}
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OrderBook;