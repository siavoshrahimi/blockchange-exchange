import React,{useEffect,useState} from "react";
import {decorateOrder, ETHER_ADDRESS, GREEN, RED} from "../helpers";
import {OverlayTrigger, Tooltip} from 'react-bootstrap'
import {groupBy} from 'lodash'
import Spinner from "./Spinner";
import {useSelector} from "react-redux";

function OrderBook({ rawOpenOrders, subscribeToTradeEvent, filledOrders}) {
    const {account, exchange} = useSelector(state => state.web3)
    const [openOrders, setOpenOrders] = useState({})
    const [loading , setLoading] = useState(false)



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
                orderFillAction :orderType === 'buy' ? 'sell' : 'buy'
            })
        }

        useEffect(() =>{
            if(rawOpenOrders.length >0 ){
                decoratingOpenOrders(rawOpenOrders)
            }
        },[rawOpenOrders, filledOrders.length])

    const renderOrder = order =>{
        return(
            <OverlayTrigger
                key={order.id}
                placement={'auto'}
                overlay={
                    <Tooltip id={order.id}>
                        {`Click here to ${order.orderFillAction} `}
                    </Tooltip>
                }
            >
                <tr key={order.id}
                    className='fill-order'
                    onClick={e =>{
                        exchange.methods.fillOrder(order.id).send({from: account})
                            .on('transactionHash', hash =>{
                                setLoading(true)
                                subscribeToTradeEvent()
                                setLoading(false)
                                //window.location.reload()
                            })
                            .on('error', error =>{
                                console.log(error);
                                window.alert('There was an error')
                            })
                    }}
                >
                    <td>{order.tokenAmount}</td>
                    <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                    <td>{order.etherAmount}</td>
                </tr>
            </OverlayTrigger>
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
                        {openOrders.hasOwnProperty('buy') && !loading? showOrderBook(openOrders) :<Spinner type='table'/>}
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OrderBook;