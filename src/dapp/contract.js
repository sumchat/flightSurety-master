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
        this.airlines = {};
        this.passengers = {};
        this.airlineNames = ['AirAB1','AirAB2','AirAB3','AirAB4','AirAB5'];
        this.passengerNames = ['PAB1','PAB2','PAb3','PAB4','PAb5'];
        this.flights = {
            'AirAB1':['FL1','FL2','FL3'],
            'AirAB2':['AL1','AL2','AL3'],
            'AirAB3':['BL1','BL2','BL3'],
            'AirAB4':['CL1','CL2','CL3'],
            'AirAB5':['DL1','DL2','DL3'],
        }
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
            let noairline = 0;
            //this.airlines.push(accts[1]);

            //while(this.airlines.length < 5) {
            while(Object.keys(this.airlines).length < 5){
                this.airlines[accts[counter++]] = this.airlineNames[noairline++]; 
                //this.airlines.push(accts[counter++]);
            }
            noairline = 0;
           // while(this.passengers.length < 5) {
            while(Object.keys(this.passengers).length < 5){
                this.passengers[accts[counter++]] = this.passengerNames[noairline++]; 
                //this.passengers.push(accts[counter++]);
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

    fetchFlightStatus(airline,flight,timestamp, callback) {
        let self = this;
        let payload = {
            airline: airline,//self.airlines[0],
            flight: flight,
            ts: timestamp//Math.floor(Date.now() / 1000)
        } 
        //console.log("airline:" + self.airlines[0]) ;
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.ts)
            .send({ from: self.owner}, (error, result) => {
                callback(error, result);
            });
    }

    registerAirline(fromairline,airlinetoregister,callback){
        let self = this;
        
        self.flightSuretyApp.methods.registerAirline(airlinetoregister.toString())
        .send({ from: fromairline.toString(),gas: 1000000}, (error, result) => {
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

    purchaseInsurance(airline,flight,passenger,funds_ether,timestamp,callback){
        let self = this;   
        console.log("airline" + airline) ;
        const fundstosend1 = self.web3.utils.toWei(funds_ether, "ether");  
        console.log(fundstosend1) ; 
        //console.log("passenger buy:" + )
        let ts = timestamp;//1553367808;
        self.flightSuretyApp.methods.registerFlight(airline.toString(),flight.toString(),ts)
        .send({ from: passenger.toString(),value: fundstosend1,gas: 1000000}, (error, result) => {
            callback(error, result);
        });
      
    }

    withdrawFunds(passenger,funds_ether,callback){
        let self = this;   
       
        const fundstowithdraw = self.web3.utils.toWei(funds_ether, "ether");       
        self.flightSuretyApp.methods.withdrawFunds(fundstowithdraw)
        .send({ from: passenger.toString()}, (error, result) => {
            callback(error, result);
        });
      
    }

    getBalance(passenger,callback){
        let self = this;
        self.flightSuretyApp.methods.getBalance().call({ from: passenger}, (error, result) => {
            callback(error,result);
        }
    );

    }


}