import {
    WEB3_LOADED,
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
