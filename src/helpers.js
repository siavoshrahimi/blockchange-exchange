import moment from "moment";

export const RED = 'danger';
export const GREEN = 'success'
export const DECIMALS =(10**18)
export const ether = wei => {
    if(wei){
        return(wei/DECIMALS)
    }
}

//same as ether
export const tokens = ether;

export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

//decorate orders
export const decorateOrder = order =>{
    let etherAmount;
    let tokenAmount;
    if (order.tokenGive === ETHER_ADDRESS){
        etherAmount = order.amountGive;
        tokenAmount = order.amountGet
    }else {
        etherAmount = order.amountGet;
        tokenAmount = order.amountGive
    }

    //calculate token price to 5 decimals places
    let tokenPrice = (etherAmount/tokenAmount)
    const precision = 100000
    tokenPrice = Math.round(tokenPrice*precision)/precision
    return({
        ...order,
        etherAmount : ether(etherAmount),
        tokenAmount : tokens(tokenAmount),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
    })
}
