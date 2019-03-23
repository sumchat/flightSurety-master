
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
        }
    });
        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });


        contract.flightSuretyApp.methods.getExistingAirlines().call({ from: contract.owner}, (error, result) => {
            console.log(result);
            populateRegisteredAirlines(result,'registeredairline');  
            populateRegisteredAirlines(result,'insuredairline');  
            populateRegisteredAirlines(result,'fundingairline');           
           
        })

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
                    populateRegisteredAirlines(result,'registeredairline'); 
                    populateRegisteredAirlines(result,'insuredairline');  
                    populateRegisteredAirlines(result,'fundingairline');                    
                   
                })
            }
            })
        });
        
        // User-submitted transaction
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
                        populateFunding(result);                   
                       
                    })
                }
            });
        })
    
          // purchase insurance for flight
          DOM.elid('purchase-insurance').addEventListener('click', () => {
            let airline = DOM.elid('insuredairline').value;
            let flight = DOM.elid('insflight-number').value;
            let funds_ether = DOM.elid('fundinsurance').value;
            // Write transaction
            contract.purchaseInsurance(airline,flight,funds_ether, (error, result) => {
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result + ' ' + result.args.flight + ' ' + result.args.timestamp} ]);
                display('Insurance', 'Purchase Insurance', [ { label: 'Purchase Insurance', error: error, value: result } ]);
            });
        })
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result + ' ' + result.args.flight + ' ' + result.args.timestamp} ]);
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result } ]);
            });
        })
    
    });
    

})();


function populateFunding(funds){
    var fund = document.getElementById("funds"); 
    fund.value = funds;
}

function populateRegisteredAirlines(registeredAirlines,airlineel){
    var list = document.getElementById(airlineel); 
    list.innerHTML = "";
    registeredAirlines.forEach((airline)=>{
        var option = document.createElement("option");
        option.text = airline;
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







