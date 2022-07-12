import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {ETHER_ADDRESS, formatBalance} from "../helpers";
import Spinner from "./Spinner";
import {Tab, Tabs} from "react-bootstrap";


function Balance() {
    const {account, exchange,token,web3} = useSelector(state => state.web3)

    const [ethBalance , setEthBalance] = useState(null)
    const [tokenBalance , setTokenBalance] = useState(null)
    const [exchangeEtherBalance , setExchangeEtherBalance] = useState(null)
    const [exchangeTokenBalance , setExchangeTokenBalance] = useState(null)
    const [loading , setLoading] = useState(true)

    const loadBalances = async (web3, exchange, token, account) =>{

        if(account !== 'undefined'){
            //Ether balance in wallet
            const ethBalance = await web3.eth.getBalance(account)
            setEthBalance(formatBalance(ethBalance))

            //Token balance in wallet
            const tokenBalance = await token.methods.balanceOf(account).call()
            setTokenBalance(formatBalance(tokenBalance))

            //Ether balance in exchange
            const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
            setExchangeEtherBalance(formatBalance(exchangeEtherBalance))

            // Token balance in exchange
            const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
            setExchangeTokenBalance(formatBalance(exchangeTokenBalance))
        }else {
            window.alert('Please login with MetaMask ')
        }
    }

    useEffect(async () =>{
        setLoading(true)
        await loadBalances(web3, exchange, token, account)
        setLoading(false)
    },[web3, exchange, token, account])

   // (ethBalance,tokenBalance,exchangeEtherBalance,exchangeTokenBalance) && setLoading(false)


    console.log(ethBalance,tokenBalance,exchangeEtherBalance,exchangeTokenBalance)

    const showForm  =() =>{
        return(
            <Tabs defaultActiveKey="deposit" className="bg-dark text-white">

                <Tab eventKey="deposit" title="Deposit" className="bg-dark">
                    <table className="table table-dark table-sm small">
                        <thead>
                        <tr>
                            <th>Token</th>
                            <th>Wallet</th>
                            <th>Exchange</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>ETH</td>
                            <td>{ethBalance}</td>
                            <td>{exchangeEtherBalance}</td>
                        </tr>
                        </tbody>
                    </table>

                    {/*<form className="row" onSubmit={(event) => {
                        event.preventDefault()
                        depositEther(dispatch, exchange, web3, etherDepositAmount, account)
                    }}>
                        <div className="col-12 col-sm pr-sm-2">
                            <input
                                type="text"
                                placeholder="ETH Amount"
                                onChange={(e) => dispatch( etherDepositAmountChanged(e.target.value) ) }
                                className="form-control form-control-sm bg-dark text-white"
                                required />
                        </div>
                        <div className="col-12 col-sm-auto pl-sm-0">
                            <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
                        </div>
                    </form>*/}

                    <table className="table table-dark table-sm small">
                        <tbody>
                        <tr>
                            <td>DAPP</td>
                            <td>{tokenBalance}</td>
                            <td>{exchangeTokenBalance}</td>
                        </tr>
                        </tbody>
                    </table>

                    {/*<form className="row" onSubmit={(event) => {
                        event.preventDefault()
                        depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account)
                    }}>
                        <div className="col-12 col-sm pr-sm-2">
                            <input
                                type="text"
                                placeholder="DAPP Amount"
                                onChange={(e) => dispatch( tokenDepositAmountChanged(e.target.value) )}
                                className="form-control form-control-sm bg-dark text-white"
                                required />
                        </div>
                        <div className="col-12 col-sm-auto pl-sm-0">
                            <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
                        </div>
                    </form>*/}

                </Tab>

                <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">

                    <table className="table table-dark table-sm small">
                        <thead>
                        <tr>
                            <th>Token</th>
                            <th>Wallet</th>
                            <th>Exchange</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>ETH</td>
                            <td>{ethBalance}</td>
                            <td>{exchangeEtherBalance}</td>
                        </tr>
                        </tbody>
                    </table>

                    {/*<form className="row" onSubmit={(event) => {
                        event.preventDefault()
                        withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account)
                    }}>
                        <div className="col-12 col-sm pr-sm-2">
                            <input
                                type="text"
                                placeholder="ETH Amount"
                                onChange={(e) => dispatch( etherWithdrawAmountChanged(e.target.value) )}
                                className="form-control form-control-sm bg-dark text-white"
                                required />
                        </div>
                        <div className="col-12 col-sm-auto pl-sm-0">
                            <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
                        </div>
                    </form>*/}

                    <table className="table table-dark table-sm small">
                        <tbody>
                        <tr>
                            <td>DAPP</td>
                            <td>{tokenBalance}</td>
                            <td>{exchangeTokenBalance}</td>
                        </tr>
                        </tbody>
                    </table>

                    {/*<form className="row" onSubmit={(event) => {
                        event.preventDefault()
                        withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account)
                    }}>
                        <div className="col-12 col-sm pr-sm-2">
                            <input
                                type="text"
                                placeholder="DAPP Amount"
                                onChange={(e) => dispatch( tokenWithdrawAmountChanged(e.target.value) )}
                                className="form-control form-control-sm bg-dark text-white"
                                required />
                        </div>
                        <div className="col-12 col-sm-auto pl-sm-0">
                            <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
                        </div>
                    </form>*/}

                </Tab>
            </Tabs>
        )
    }
    return(
        <div className="card bg-dark text-white">
            <div className="card-header">
                Balances
            </div>
            <div className="card-body">
                {(!loading && ethBalance && tokenBalance && exchangeEtherBalance && exchangeTokenBalance )
                    ? showForm()
                    : <Spinner/>
                }
            </div>
        </div>
    )
}

export default Balance;