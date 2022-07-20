import React, {useEffect, useState} from "react";
import Spinner from "./Spinner";
import {Tab, Tabs} from "react-bootstrap";
import {useSelector} from "react-redux";
import {ETHER_ADDRESS, formatBalance} from "../helpers";

function NewOrder({subscribeToOrderEvent, allOrders}) {
    const {account, exchange,token,web3} = useSelector(state => state.web3)

    const [amount, setAmount] = useState(null)
    const [price, setPrice] = useState(null)
    const [loading, setLoading] = useState(false)
    const [exchangeEtherBalance , setExchangeEtherBalance] = useState(null)
    const [exchangeTokenBalance , setExchangeTokenBalance] = useState(null)

    const buyOrder = async (web3, exchange, token, account, amount, price) =>{
        const tokenGet = token.options.address;
        const amountGet = web3.utils.toWei(amount, 'ether')
        const tokenGive = ETHER_ADDRESS
        const amountGive = web3.utils.toWei((amount*price).toString(), 'ether')

        exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({from: account})
            .on('transactionHash', hash => {
                setLoading(true)
                subscribeToOrderEvent()
                setPrice(null)
                setAmount(null)
                setLoading(false)
            })
            .on('error' , error=>{
                window.alert('there was an error')
            })
    }

    const sellOrder = async (web3, exchange, token, account, amount, price) =>{
        const tokenGet = ETHER_ADDRESS
        const amountGet = web3.utils.toWei((amount*price).toString(), 'ether')
        const tokenGive = token.options.address;
        const amountGive = web3.utils.toWei(amount, 'ether')

        exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({from: account})
            .on('transactionHash', hash => {
                setLoading(true)
                subscribeToOrderEvent()
                setPrice(null)
                setAmount(null)
                setLoading(false)
            })
            .on('error' , error=>{
                window.alert('there was an error')
            })
    }

    useEffect(async () =>{
         setExchangeEtherBalance(await exchange.methods.balanceOf(ETHER_ADDRESS, account).call())
         setExchangeTokenBalance(await exchange.methods.balanceOf(token.options.address, account).call())
    },[allOrders, exchange])


    const showForm = () =>{
        return(
            <Tabs defaultActiveKey="buy" className="bg-dark text-white">

                <Tab eventKey="buy" title="Buy" className="bg-dark">

                    <form onSubmit={async (event) => {
                        event.preventDefault()
                        if(formatBalance(exchangeEtherBalance) < (amount * price)){
                            window.alert("You don't have sufficient Eth in your exchange's account please charge your account first")
                        }else {
                            await buyOrder( web3, exchange, token, account, amount, price)
                        }

                    }}>
                        <div className="form-group small mt-2">
                            <label>Buy Amount (DAPP)</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-dark text-white"
                                    placeholder="Buy Amount"
                                    onChange={(e) => setAmount( e.target.value )}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group small mt-3">
                            <label>Buy Price</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-dark text-white"
                                    placeholder="Buy Price"
                                    onChange={(e) => setPrice( e.target.value )}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm btn-block mt-2">Buy Order</button>
                        { price && amount ? <small>Total: {amount * price} ETH</small> : null }
                    </form>

                </Tab>

                <Tab eventKey="sell" title="Sell" className="bg-dark">

                    <form onSubmit={async (event) => {
                        event.preventDefault()
                        if(formatBalance(exchangeTokenBalance) < amount){
                            window.alert("You don't have sufficient Dapp token in your exchange's account please charge your account first")
                        }else {
                            await sellOrder( web3, exchange, token, account, amount, price)
                        }
                    }}>
                        <div className="form-group small mt-2">
                            <label>Sell Amount (DAPP)</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-dark text-white"
                                    placeholder="Sell amount"
                                    onChange={(e) => setAmount( e.target.value )}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group small mt-3">
                            <label>Sell Price</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-dark text-white"
                                    placeholder="Sell Price"
                                    onChange={(e) => setPrice( e.target.value )}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm btn-block mt-2">Sell Order</button>
                        { price && amount ? <small>Total: {amount * price} ETH</small> : null }
                    </form>

                </Tab>
            </Tabs>
        )
    }
    return(
        <div className="card bg-dark text-white">
            <div className="card-header">
                New Order
            </div>
            <div className="card-body">
               {!loading? showForm() : <Spinner/>}
            </div>
        </div>
    )
}

export default NewOrder