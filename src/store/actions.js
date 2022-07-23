import {
    WEB3_LOADED,
    GET_ACCOUNT
} from "./types";

export function web3Loaded(web3, account, token, exchange) {
    return{
        type:WEB3_LOADED,
        web3,
        account,
        token,
        exchange
    }
}

export function connectWallet(account) {
    return{
        type:GET_ACCOUNT,
        account
    }
}
