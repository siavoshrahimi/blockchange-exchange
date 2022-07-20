require('dotenv').config();
require('babel-register');
require('babel-polyfill');
let privateKeys = process.env.PRIVATES_KEYS || "";
const HDWalletProvider = require('truffle-hdwallet-provider-privkey');

privateKeys = privateKeys.split(",")
const nodeUrl = `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`


module.exports = {
  networks: {

     development: {
       host: "127.0.0.1",     // Localhost (default: none)
       port: 8545,            // Standard Ethereum port (default: none)
       network_id: "*",       // Any network (default: none)
     },
      kovan:{
         provider:function () {
             return new HDWalletProvider(
                privateKeys, // array of account private keys
                 nodeUrl// URL to Ethereum node
             )
         },
          gas:5000000,
          gasPrice:25000000000,
          network_id: 42
      }
  },
  contracts_directory:'./src/contracts',
  contracts_build_directory:'./src/abis/',

  // Configure your compilers
  compilers: {
      solc: {
          version: "0.8.0",
          optimizer: {
          enabled: true,
          runs: 200
        }
      }
  },
};
