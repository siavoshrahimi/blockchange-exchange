import React, {useEffect, useState} from "react";
import {connectToWallet} from '../store/interactions'
import {useDispatch, useSelector} from "react-redux";



function Navbar(){

    const dispatch = useDispatch();
    const {account} = useSelector(state => state.web3)

    useEffect(() =>{

    },[account])
    const getAccount =  () =>{
       dispatch(connectToWallet())
    }
    return(
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-2" style={{justifyContent:"space-between"}}>
            <a className="navbar-brand" href="/#">Dapp Token Exchange</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item">
                        {account ?
                            <a
                                className="nav-link small"
                                href= {`https://etherscan.io/address/${account}`}
                            >
                                {account}
                            </a>
                            :<button className=" btn btn-outline-light btn-block btn-sm" onClick={() =>getAccount()}>Connect</button>
                        }
                    </li>
                </ul>
            </div>


        </nav>
    )


}

export default Navbar