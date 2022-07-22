import Web3 from "web3";
import {
    web3Loaded,
} from "./actions";
import Token from "../abis/Token";
import Exchange from "../abis/Exchange";

export const loadWeb3 =() => async dispatch =>{
    if(typeof window.ethereum !== undefined ){
        const web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts();
        const account=  accounts[0];
        const networkId = await web3.eth.net.getId();
        debugger
        if(networkId === 42){
            const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address);
            const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address);
            dispatch(web3Loaded(web3, account, token, exchange))
        }else {
            window.alert("Please connect your wallet to kovan network and refresh the page")
        }

    } else {
        window.alert('Please install MetaMask')
        window.location.assign("https://metamask.io/")
    }


}



