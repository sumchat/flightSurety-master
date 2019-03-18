import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


// Flight status codees
constant STATUS_CODE_UNKNOWN = 0;
constant STATUS_CODE_ON_TIME = 10;
constant STATUS_CODE_LATE_AIRLINE = 20;
constant STATUS_CODE_LATE_WEATHER = 30;
constant STATUS_CODE_LATE_TECHNICAL = 40;
constant STATUS_CODE_LATE_OTHER = 50;
const ORACLES_COUNT = 20; 
const STATUSCODES  = [STATUS_CODE_UNKNOWN, STATUS_CODE_ON_TIME, STATUS_CODE_LATE_AIRLINE, STATUS_CODE_LATE_WEATHER, STATUS_CODE_LATE_TECHNICAL, STATUS_CODE_LATE_OTHER];
 /* // Track all registered oracles
 let oracles= {};
let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

// ARRANGE
let fee = await flightSuretyApp.REGISTRATION_FEE.call();
//var registerOracle = async function(){
      web3.eth.getAccounts((error, accounts) => {
        for(let a=12; a<ORACLES_COUNT; a++) { 
          try {
              await flightSuretyApp.methods.registerOracle({ from: accounts[a], value: fee });             
              let result = await flightSuretyApp.methods.getMyIndexes({from: accounts[a]});
              oracles[accounts[a]] = result;
              console.log("registered oracle with address:" + accounts[a]);
              } 
          catch(e) {
              console.log('Error while registering oracle with address:' + accounts[a] );
              }     
    
        }
      })
//}

//registerOracle();

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    else{
      const index = event.returnValues.index;
      const airline = event.returnValues.airline;
      const flight = event.returnValues.flight;
      const timestamp = event.returnValues.timestamp;
      

      for(var key in oracles)
      {
        var indexes = oracles[key];
        if(indexes.includes(index))
        {
          try{
          let randomstatusCode = STATUSCODES[Math.floor(Math.random()*STATUSCODES.length)];
          flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, randomstatusCode,{ from: key});
          console.log("statuscode:" + randomstatusCode + " for "+ accounts[a])
          }
          catch(e) {
            console.log('Error while submitting oracle response:' + accounts[a] );
            }  

        }
      }
      console.log(event);

    }
    
}); */

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


