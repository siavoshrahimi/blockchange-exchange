import React,{useEffect} from 'react';
import './App.css';

import {
    loadWeb3
} from "../store/interactions";
import {useDispatch, useSelector} from "react-redux";
import Navbar from "./Navbar";
import Content from "./Content";


function App () {
    const dispatch = useDispatch();


    useEffect(  () =>{
         dispatch(loadWeb3())
        debugger
    },[dispatch])

    const {exchange,account,isLoading} = useSelector(state => state.web3)


    return (
        <div>
            <Navbar account={account}/>
            {isLoading ? <div className='content'/> :<Content exchange={exchange}/>}
        </div>
    );
}

export default App;

