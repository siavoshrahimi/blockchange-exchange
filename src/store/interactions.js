import Web3 from "web3";
import {
    web3Loaded,
} from "./actions";
import Token from "../abis/Token";
import Exchange from "../abis/Exchange";

export const loadWeb3 =() => async dispatch =>{
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545' );
    const accounts = await web3.eth.getAccounts();
    const account=  accounts[0];
    const networkId = await web3.eth.net.getId();
    if(networkId === 1 || networkId === 3 || networkId === 4 || networkId === 5 || networkId == null){
        window.alert('Token smart contract not detected on the current network. Please select another network with Metamask')
    }
    const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address);
    const exchange= new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address);

    dispatch(web3Loaded(web3, account, token, exchange))
}



