var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
//var NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker")

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
      },      
      network_id: '*',
      gas: 4698712,
      //network_id: 4,
      //gas: 4500000,
      gasPrice: 1000000,
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24",
      optimizer: {
        enabled: true,
        //runs: 200
      }
    }
    
  }
};