pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping (address => bool) private registeredAirlines;
    mapping (address => uint) private fundedAirlines;
    mapping(address => uint256) private authorizedContracts;
    address[] airlines;

//this will track insurance for each passenger
   /*  struct passengerInsurance {
        address  airline;  
        string   flight; 
        uint256  timestamp;  
        uint     insuranceamount;  
        uint    payout;   
    } */
    //this will track insurance for each airline
    //use Pascal case for sruct
    struct Airlineinsurance {
        address  customer;  
        string   flight; 
        uint256  timestamp;  
        uint     insuranceamount;  
        uint    payout;   
    }
   
    mapping (bytes32 => Airlineinsurance[]) airlinesInsuranceHistory;
   // mapping (address => passengerInsurance[]) passengerInsuranceHistory;
    mapping(address => uint256) private accountBalance;
     // Max Fee to be paid when buying insurance
    uint256 public constant MAX_INSURANCE_FEE = 1 ether;
    uint256 public constant MIN_FUNDING_AMOUNT = 10 ether;
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirline
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        registeredAirlines[firstAirline] = true;
        airlines.push(firstAirline);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

     modifier requireIsCallerAirlineRegistered(address caller)
    {
        require( registeredAirlines[caller] == true, "Caller not registered");
        _;
    }

     modifier requireisAirlineNotRegistered(address airline)
    {
        require( registeredAirlines[airline] == false, "Airline already registered");
        _;
    }
    modifier requireIsCallerAuthorized()
    {
        require(authorizedContracts[msg.sender] == 1, "Caller is not contract owner");
        _;
    } 

    /*modifier requireisAirlineFunded(address airline)
    {
        require( fundedAirlines[airline] >= 10, "Airline must submit funds of 10 ether");
        _;
    }*/
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/
    function isAirlineRegistered(address airline)
                            public
                            view
                            returns (bool)
    {
        return registeredAirlines[airline];
    }
    /**
    * @dev airline can only take part in registration of other airlines
    *     if it has more than 10 ether in its balance  
    */
    function isAirlineFunded(address airline)
                            public
                            view
                            returns (bool)
    {
        if(fundedAirlines[airline] >= MIN_FUNDING_AMOUNT)
            return true;
        else
            return false;
    }
    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/
    
     function authorizeCaller
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        authorizedContracts[contractAddress] = 1;
    }

    function deauthorizeCaller
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        delete authorizedContracts[contractAddress];
    }
   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (  
                                address airline 
                            )
                            external
                            requireIsOperational
                            requireIsCallerAuthorized  
                            requireisAirlineNotRegistered(airline)                     
                            returns(bool success)
    {
        require(airline != address(0));    
        registeredAirlines[airline] = true;
        airlines.push(airline);
        return registeredAirlines[airline];
    }

    function getAirlines()
                external
                view
                returns(address[]) 


    {
        return airlines;
    }
    

/**
  * @dev airline can deposit funds in any amount  
 */
    function fundAirline
                            (
                                address airline,
                                uint amount
                            )
                            external                            
                            requireIsOperational
                            requireIsCallerAuthorized
                            requireIsCallerAirlineRegistered(airline)
                           
    {
        fundedAirlines[airline] += amount;
    }

    /**
  * @dev to see how much fund an airline has  
 */
    function getAirlineFunds
                            (
                                address airline
                               
                            )
                            external 
                            view                           
                            requireIsOperational
                            requireIsCallerAuthorized
                            requireIsCallerAirlineRegistered(airline)
                             returns(uint funds)
                           
    {
        return (fundedAirlines[airline]);
    }


   /**
    * @dev Buy insurance for a flight. If a passenger sends more than 1 ether then the excess is returned.
    *
    */   
    
    function buy
                            (  
                              address  airline, 
                              string flight,uint256 _timestamp,address sender, uint amount                           
                            )
                            external
                            requireIsOperational
                            requireIsCallerAuthorized
                            requireIsCallerAirlineRegistered(airline)
                            payable
    {
        
        uint excessamount = 0;
        uint netamount = 0;
        bytes32 flightkey = getFlightKey(airline,flight,_timestamp);
        if(amount > MAX_INSURANCE_FEE)
        {
            excessamount =  amount - MAX_INSURANCE_FEE;
            netamount = MAX_INSURANCE_FEE;
        }
        else{
            netamount = amount;
        }

       // passengerInsurance memory _cusinsurance = passengerInsurance({airline:airline,flight:flight,timestamp:_timestamp,insuranceamount:netamount,payout:0});
       // passengerInsuranceHistory[sender].push(_cusinsurance);
         Airlineinsurance memory _airinsurance = Airlineinsurance({customer:sender,flight:flight,timestamp:_timestamp,insuranceamount:netamount,payout:0});
         //airlinesInsuranceHistory[flightkey] = _airinsurance;
        airlinesInsuranceHistory[flightkey].push(_airinsurance);
       /*  if(amount > MAX_INSURANCE_FEE)
        {
            sender.transfer(excessamount);
        } */
        
       
        
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    address airline,
                                    string flight,
                                    uint256 timestamp
                                )
                                external
                                requireIsOperational
                                requireIsCallerAuthorized
                                
    {
        //get all the insurees
        bytes32 flightkey = getFlightKey(airline,flight,timestamp);
        Airlineinsurance[] storage insurees = airlinesInsuranceHistory[flightkey];
         for(uint i = 0; i < insurees.length; i++) {
            uint256 payout = insurees[i].insuranceamount.mul(15).div(10);
            if(insurees[i].payout == 0)
            {
                insurees[i].payout = payout;
                accountBalance[insurees[i].customer].add(payout);     
            }      
        }
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                address customerAddress
                            )
                            external
                            requireIsOperational
                            requireIsCallerAuthorized
                            
    {
        

        uint256 prev = accountBalance[customerAddress];
        accountBalance[customerAddress] = 0;
        customerAddress.transfer(prev);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

