import React from "react";

function Spinner({type}) {
    if (type ==='table'){
        return(<tbody className='spinner-border table-light text-center'/> )
    }else {
        return(<div className='spinner-border table-light text-center'/> )
    }
}

export default Spinner