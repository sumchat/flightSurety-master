
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

      contract.flightSuretyApp.events.FlightStatusInfo({
        fromBlock: 0
      }, function (error, result) {
        if (error) console.log(error)
        else{
            display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result + ' ' + result.args.flight + ' ' + result.args.timestamp} ]);
            let passenger = DOM.elid('insuredpassengers').value;                    
            contract.getBalance(passenger, (error, result) => {
                if(!error)
                {
                    const funds = contract.web3.utils.fromWei(result, 'ether'); 
                    populateBalance(funds);
                }                        
               
            });
        }
    });
        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });


        contract.flightSuretyApp.methods.getExistingAirlines().call({ from: contract.owner}, (error, result) => {
            console.log(result);
            populateRegisteredAirlines(contract.airlines,result,'registeredairline');  
            populateRegisteredAirlines(contract.airlines,result,'insuredairline');  
            populateRegisteredAirlines(contract.airlines,result,'fundingairline');  
            populateRegisteredAirlines(contract.airlines,result,'statusairline');         
            initialize(contract.flights,contract.airlines);
            populateAirlines(contract.airlines,result,'airlineaddress');
           
          //populate airline funding
            let fundingairline = DOM.elid('fundingairline').value;              
            contract.flightSuretyApp.methods.getAirlineFunds(fundingairline.toString()).call({ from: contract.owner}, (error, result) => { 
            const funds_ether = contract.web3.utils.fromWei(result, 'ether');                           
            populateFunding(funds_ether);                 
            })            
            
        })
         
        populatePassengerList(contract.passengers,'insuredpassengers');
        populatePassengerList(contract.passengers,'passengers');
        //populates all the airlines in the airline to register dropdown
        //populate insured funds
        let passenger = DOM.elid('insuredpassengers').value;                    
        contract.getBalance(passenger, (error, result) => {
            if(!error)
            {
                const funds = contract.web3.utils.fromWei(result, 'ether'); 
                populateBalance(funds);
            }                        
           
        });

        DOM.elid('register-Airline').addEventListener('click', () => {
            let x = DOM.elid('registeredairline');
            let airlinetoregister = DOM.elid('airlineaddress').value;
            console.log("to airline:" + airlinetoregister);
            let fromairline = x.options[x.selectedIndex].value; 
            console.log("from:" + fromairline);
            contract.registerAirline(fromairline,airlinetoregister,(error,result) => {
               
                if(error)
                    display('Airlines', 'Register Airline', [ { label: 'Register Airline', error: error, value: result } ]);

                if(!error){
                    display('Airlines', 'Register Airline', [ { label: 'Register Airline', error: error, value: result } ]);

                contract.flightSuretyApp.methods.getExistingAirlines().call({ from: contract.owner}, (error, result) => {
                    console.log(result);
                    populateRegisteredAirlines(contract.airlines,result,'registeredairline'); 
                    populateRegisteredAirlines(contract.airlines,result,'insuredairline');  
                    populateRegisteredAirlines(contract.airlines,result,'fundingairline');
                    populateRegisteredAirlines(contract.airlines,result,'statusairline'); 
                    populateAirlines(contract.airlines,result,'airlineaddress');       
                    initialize(contract.flights,contract.airlines);
                    initializeStatus(contract.flights,contract.airlines); 
                   
                })
            }
            })
        });
        
        // User-submitted transaction
        DOM.elid('fundingairline').addEventListener('change', () => {
          
            let fundingairline = DOM.elid('fundingairline').value;            
           
                    contract.flightSuretyApp.methods.getAirlineFunds(fundingairline.toString()).call({ from: contract.owner}, (error, result) => {
                        const funds_ether = contract.web3.utils.fromWei(result, 'ether'); 
                        populateFunding(funds_ether);                  
                       
                    })            
        })


        DOM.elid('fund-airline').addEventListener('click', () => {
            let funds_ether = DOM.elid('fundAirline').value;
            let fundingairline = DOM.elid('fundingairline').value;
            
            // Write transaction
            contract.sendFunds(fundingairline,funds_ether, (error, result) => {
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result + ' ' + result.args.flight + ' ' + result.args.timestamp} ]);
                display('Airline Funding', 'Send Funds', [ { label: 'Send Funds', error: error, value: result } ]);
                if(!error){
                    contract.flightSuretyApp.methods.getAirlineFunds(fundingairline.toString()).call({ from: contract.owner}, (error, result) => {
                        console.log(result);
                        const funds_ether = contract.web3.utils.fromWei(result, 'ether'); 
                        populateFunding(funds_ether);                   
                       
                    })
                }
            });
        })
    
          // purchase insurance for flight
          DOM.elid('purchase-insurance').addEventListener('click', () => {
            let airline = DOM.elid('insuredairline').value;
            let flight = DOM.elid('insflight-number').value;
            let funds_ether = DOM.elid('fundinsurance').value;
            let passenger = DOM.elid('passengers').value;
            let ts = DOM.elid('datepicker').value;
            console.log("ts:" + ts);
            let timestamp = new Date(ts).getTime()/1000;
            console.log("timestamp:" + timestamp);
            // Write transaction
            contract.purchaseInsurance(airline,flight,passenger,funds_ether,timestamp, (error, result) => {
                
                display('Insurance', 'Purchase Insurance', [ { label: 'Purchase Insurance', error: error, value: result } ]);
            });
        })
        // withdraw balance for flight
        DOM.elid('withdraw-funds').addEventListener('click', () => {
            let funds = DOM.elid('withdrawamount').value;
            let passenger = DOM.elid('insuredpassengers').value;
            //let funds_ether = DOM.elid('fundinsurance').value;
            // Write transaction
            contract.withdrawFunds(passenger,funds, (error, result) => {
               
                display('Withdraw', 'Withdraw Funds', [ { label: 'Withdraw Funds', error: error, value: result } ]);
                let passenger = DOM.elid('insuredpassengers').value;                    
                contract.getBalance(passenger, (error, result) => {
                    if(!error)
                    {
                        const funds = contract.web3.utils.fromWei(result, 'ether'); 
                        populateBalance(funds);
                    }                        
                   
                });
            });
        })

        DOM.elid('insuredpassengers').addEventListener('change', () => {
            let passenger = DOM.elid('insuredpassengers').value;
            
            contract.getBalance(passenger, (error, result) => {
                if(error)
                {
                    display('Withdraw', 'Withdraw funds', [ { label: 'Get Balance', error: error, value: result } ]);
                    populateBalance(0);
                }
                else
                {
                    const funds = contract.web3.utils.fromWei(result, 'ether'); 
                    populateBalance(funds);
                }
               
            });
        })

        DOM.elid('insuredairline').addEventListener('change', () => {
            let airline = DOM.elid('insuredairline').value;
           // console.log("test airline" + airline);
            let airlineName = contract.airlines[airline]
            let flights = contract.flights[airlineName];
            populateFlights(flights,'insflight-number');
           
        })
        DOM.elid('statusairline').addEventListener('change', () => {
            let airline = DOM.elid('statusairline').value;
            let airlineName = contract.airlines[airline]
            console.log(airlineName);
            let flights = contract.flights[airlineName];
            console.log("flights:",console.log(contract.flights))
            populateFlights(flights,'flight-number');
           
        })
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            let airline = DOM.elid('statusairline').value;
            let ts = DOM.elid('statusdatepicker').value;
            let timestamp = new Date(ts).getTime()/1000;
            // Write transaction
            contract.fetchFlightStatus(airline,flight,timestamp, (error, result) => {
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result + ' ' + result.args.flight + ' ' + result.args.timestamp} ]);
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result } ]);               
                   
                
            });
        })

        // testing User-submitted transaction
       // getExistingAirlines().call({ from: contract.owner}, (error, result) => {
      /*   DOM.elid('getinsured').addEventListener('click', () => {
            //let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.flightSuretyApp.methods.getInsured(contract.airlines[0],'A234',1553367808).call((error, result) => {
               // contract.flightSuretyApp.methods.getBalancetest().call((error, result) => {
                console.log("balance:" + result);
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result + ' ' + result.args.flight + ' ' + result.args.timestamp} ]);
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result } ]);
            });
        })

        DOM.elid('getinsuredamount').addEventListener('click', () => {
            //let flight = DOM.elid('flight-number').value;
            // Write transaction
            //contract.flightSuretyApp.methods.getInsured(contract.airlines[0],'A234',1553367808).call((error, result) => {
                contract.flightSuretyApp.methods.getInsuredamount(contract.airlines[0],'A234',1553367808).call((error, result) => {
                console.log("amountbalance:" + result);
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result + ' ' + result.args.flight + ' ' + result.args.timestamp} ]);
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result } ]);
            });
        }) */
    
    });
    

})();

function initialize(allflights,airlines)
{
    //initialize flights
    let airline = DOM.elid('insuredairline').value; 
    let selectedairline = airlines[airline];
    console.log("insured airline:" + selectedairline);   
     let flights = allflights[selectedairline];
     populateFlights(flights,'insflight-number');

     //initialize flights for getStatus
    airline = DOM.elid('statusairline').value; 
    selectedairline = airlines[airline];
    console.log("status airline:" + selectedairline);   
      flights = allflights[selectedairline];
     populateFlights(flights,'flight-number');
}

function initializeStatus(allflights,airlines)
{
    //initialize flights
    let airline = DOM.elid('statusairline').value; 
    let selectedairline = airlines[airline];
    //console.log("insured airline:" + selectedairline);   
     let flights = allflights[selectedairline];
     populateFlights(flights,'flight-number');
}

function populateBalance(balance)
{
    var balancetxt = document.getElementById("balanceamount");
     balancetxt.value = balance;
     console.log("balance :"+ balance);
}

function populatePassengerList(passengers,elid){
    var list = document.getElementById(elid); 
    list.innerHTML = "";

    Object.keys(passengers).forEach(function(key) {
       
        var option = document.createElement("option");
        option.text = passengers[key];
        option.value = key;
        list.add(option);
    });
   
}

function populateFunding(funds){
    var fund = document.getElementById("funds"); 
    
    fund.value = funds;
}

function populateRegisteredAirlines(airlines,registeredAirlines,airlineel){
    var list = document.getElementById(airlineel); 
    list.innerHTML = "";
    registeredAirlines.forEach((airline)=>{
        var option = document.createElement("option");
        var airlineName = airlines[airline];
        option.value = airline;
        option.text = airlineName;
        list.add(option);
       
    }) 
}
function populateAirlines(airlines,registeredairlines,airlineid)
{
    var list = document.getElementById(airlineid); 
    list.innerHTML = "";
    Object.keys(airlines).forEach(function(key) {
       if(!registeredairlines.includes(key))
       {
        var option = document.createElement("option");
        option.text = airlines[key];
        option.value = key;
        list.add(option);
       }
    });
    
}

function populateFlights(flights,elid)
{
    var list = document.getElementById(elid); 
    list.innerHTML = "";
    flights.forEach((flight)=>{
        var option = document.createElement("option");
        option.text = flight;
        list.add(option);
       
    })
}

function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







