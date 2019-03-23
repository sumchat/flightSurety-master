import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        /* this.flightSuretyApp.FlightStatusInfo().watch({}, '', function(error, result) {
            if (!error) {
                console.log("Error in transaction");
                console.log("Airline:\n" + result.args.airline) ;
            }
        }) */
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            this.airlines.push('0xf17f52151EbEF6C7334FAD080c5704D77216b732');
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });

    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, result);
            });
    }

    registerAirline(fromairline,airlinetoregister,callback){
        let self = this;
        
        self.flightSuretyApp.methods.registerAirline(airlinetoregister.toString())
        .send({ from: fromairline.toString()}, (error, result) => {
            callback(error, result);
        });
    }
   
    sendFunds(airline,funds,callback){
        let self = this;    
        const fundstosend = self.web3.utils.toWei(funds, "ether");  
        console.log(fundstosend) ; 
        self.flightSuretyApp.methods.AirlineFunding()
        .send({ from: airline.toString(),value: fundstosend}, (error, result) => {
            callback(error, result);
        });
    }

    purchaseInsurance(airline,flight,funds_ether,callback){
        let self = this;   
        console.log("airline" + airline) ;
        const fundstosend = self.web3.utils.toWei(funds_ether, "ether");  
        console.log(fundstosend) ; 
        let ts = 0;//1553367808;
        self.flightSuretyApp.methods.registerFlight(airline.toString(),flight.toString(),ts)
        .send({ from: '0x821aea9a577a9b44299b9c15c88cf3087f3b5544',value: fundstosend,gasPrice:1000000}, (error, result) => {
            callback(error, result);
        });
    }


}