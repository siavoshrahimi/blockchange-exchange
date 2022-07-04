import{combineReducers} from "redux";
import {
    WEB3_LOADED,
} from "./types";

const initialState = {
    web3:{},
    account:null,
    token:{},
    exchange:{},
    isLoading:true
};

function web3(state = initialState , action) {
    switch (action.type) {
        case WEB3_LOADED:
            return {
                ...state,
                web3: action.web3,
                account: action.account,
                token:action.token,
                exchange:action.exchange,
                isLoading: false
            }
        default:
            return state
    }
}

const rootReducer =combineReducers({
    web3
})

export default rootReducer;