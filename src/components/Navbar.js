import React from "react";

function Navbar(props){
    return(
        <nav className="navbar navbar-expand-sm navbar-dark bg-primary px-2" style={{justifyContent:"space-between"}}>
            <a className="navbar-brand" href="/#">Dapp Token Exchange</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                    <a
                        className="nav-link small"
                        href= {`https://etherscan.io/address/${props.account}`}
                     >
                        {props.account}
                    </a>
                </li>
            </ul>
        </nav>
    )


}

export default Navbar