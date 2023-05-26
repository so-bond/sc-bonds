import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import Web3 from "web3";
import Ganache from "ganache";
import { Web3FunctionProvider } from "@saturn-chain/web3-functions";
import { EthProviderInterface } from "@saturn-chain/dlt-tx-data-functions";
import { EventData } from "web3-eth-contract";
import allContracts from "../contracts";
import { SmartContract, SmartContractInstance } from "@saturn-chain/smart-contract";
import { blockGasLimit, makeReadyGas, registerGas } from "./gas.constant";
import { makeBondDate } from "./dates";
import { collectEvents, getEvents } from "./events";

const RegisterContractName = "Register";
const PrimaryIssuanceContractName = "PrimaryIssuance";
const BilateralTradeContractName = "BilateralTrade";


describe("Run tests of the Issuance and Bilateral Trades contracts", function () {
  this.timeout(10000);
  let web3: Web3;
  let cak: EthProviderInterface;
  let bnd: EthProviderInterface;
  let custodianA: EthProviderInterface;
  let custodianB: EthProviderInterface;
  let investorA: EthProviderInterface;
  let investorB: EthProviderInterface;
  let investorC: EthProviderInterface;
  let investorD: EthProviderInterface;
  let registerContract: SmartContract;
  let register: SmartContractInstance;
  let addressOfPIA: string;
  let wrongAccount: EthProviderInterface;

  async function init(): Promise<void> {
    web3 = new Web3(Ganache.provider({ default_balance_ether: 1000, gasLimit: blockGasLimit, chain: {vmErrorsOnRPCResponse:true} }) as any);
    cak = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[0]));
    bnd = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[1]));
    custodianA = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[2]));
    custodianB = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[3]));
    investorA = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[4]));
    investorB = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[5]));
    investorC = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[6]));
    investorD = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[7]));
    wrongAccount = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[8]));

    const dates = makeBondDate(5, 1309402208-1309302208);

    const bondName = "EIB 3Y 1Bn SEK";
    const isin = "EIB3Y";
    const expectedSupply = 1000;
    const currency = web3.utils.asciiToHex("SEK");
    const unitVal = 100000;
    const couponRate = 0.4 * 100 * 10000;
    // const creationDate = 1309002208; //UTC
    // const issuanceDate = 1309102208; //UTC
    // const maturityDate = 2009202208; //UTC
    // const couponDates = [1309302208, 1309402208, 1309502208, 1309602208, 1309702208]; //UTC
    // const defaultCutofftime = 17 * 3600; //17:00
    
    console.log("deploying register");
    if (allContracts.get(RegisterContractName)) {
      registerContract = allContracts.get(RegisterContractName);
      register = await registerContract.deploy(
        async (name, bytes)=>{
          const r = await (cak.test()(undefined as any,bytes));
          console.log("Deployment Required gas", r.result);
          
          return await cak.newi({maxGas: r.result})(name, bytes);
        },
        bondName,
        isin,
        expectedSupply,
        currency,
        unitVal,
        couponRate,
        dates.creationDate,
        dates.issuanceDate,
        dates.maturityDate,
        dates.couponDates,
        dates.defaultCutofftime
      );
      // register = await registerContract.deploy(
      //   cak.newi({ maxGas: registerGas}),
      //   bondName,
      //   isin,
      //   expectedSupply,
      //   currency,
      //   unitVal,
      //   couponRate,
      //   dates.creationDate,
      //   dates.issuanceDate,
      //   dates.maturityDate,
      //   dates.couponDates,
      //   dates.defaultCutofftime
      // );
    } else {
      throw new Error(RegisterContractName + " contract not defined in the compilation result");
    }
    await collectEvents(cak, register);


    // Have the CAK declare the actors
    await register.grantBndRole(cak.send({maxGas:100000}), await cak.account()); // needed to create a dummy primary issuance smart contract

    await register.grantBndRole(cak.send({maxGas:100000}), await bnd.account());

    await register.grantCstRole(cak.send({maxGas:100000}), await custodianA.account());

    await register.grantCstRole(cak.send({maxGas:100000}), await custodianB.account());

    await register.enableInvestorToWhitelist(custodianA.send({maxGas:130000}), await cak.account()); // needed to deploy a test trade contract
    
    //FIXME: maybe remove this since auto-bnd whitelisting was added in register transferFrom
    // await register.enableInvestorToWhitelist(custodianA.send({maxGas:120000}), await bnd.account()); // B&D must be an investor as well
    
    await register.enableInvestorToWhitelist(custodianA.send({maxGas:130000}), await investorA.account());
    
    await register.enableInvestorToWhitelist(custodianA.send({maxGas:130000}), await investorB.account());
    
    await register.enableInvestorToWhitelist(custodianA.send({maxGas:130000}), await investorC.account());
    
    await register.enableInvestorToWhitelist(custodianA.send({maxGas:130000}), await investorD.account());
    // Have the CAK register the smart contracts
    
    const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(cak.newi({maxGas:1000000}), register.deployedAt, 1500);
    
    let hash = await register.atReturningHash(cak.call(), primary.deployedAt);
    
    await register.enableContractToWhitelist(cak.send({maxGas:120000}), hash);
    
    const trade = await allContracts.get(BilateralTradeContractName).deploy(cak.newi({maxGas:1000000}), register.deployedAt, await cak.account());
    
    hash = await register.atReturningHash(cak.call(), trade.deployedAt);
    
    await register.enableContractToWhitelist(cak.send({maxGas:120000}), hash);
    
    // Initialize the primary issuance account
    await register.setExpectedSupply(cak.send({maxGas:100000}),1000);

    await register.makeReady(cak.send({maxGas: makeReadyGas}));


    addressOfPIA = await register.primaryIssuanceAccount(cak.call());

  }

  describe("Primary issuance (basic-impl)", function () {
    before(async () => {

      await init();
      
    });

    it('should have the register initialized', async () => {
      const isBnD = await register.isBnD(bnd.call(), await bnd.account());
      expect(isBnD).to.be.true;

      const balanceOfPIA = await register.balanceOf(cak.call(), addressOfPIA);
      expect(balanceOfPIA).to.be.equal('1000');

      getEvents(register).print();
    });
    
    describe("when primary.validate() is called", function () {
      before(async () => {
        await init();
      });

      it("B&D should have the issuance amount", async () => {
        // Given the B&D deploys a Primary Issuance contract
        const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({ maxGas: 1000000 }), register.deployedAt, 1500);
        
        // When the B&D finalize the transfer
        await primary.validate(bnd.send({ maxGas: 200000 }));
      
        // Expect the B&D account should be credited of the issuance account balance
        const balanceOfPIA = await register.balanceOf(cak.call(), addressOfPIA);
        const balanceOfBnD = await register.balanceOf(bnd.call(), await bnd.account());
        expect(balanceOfPIA).to.be.equal("0");
        expect(balanceOfBnD).to.be.equal("1000");
      });      

    });
  })


  describe("PrimaryIssuance Distribution from B&D (fresh deploy)", function () {
    beforeEach(async () => { //provide a fresh register contract each time (test isolation)
      await init();
    });

    it("BnD cannot finalize (validate()) Primary Issuance a second time", async () => {
      const contract = allContracts.get(PrimaryIssuanceContractName);
      const primary = await contract.deploy(bnd.newi({ maxGas: 1000000 }), register.deployedAt, 1500);
      await primary.validate(bnd.send({ maxGas: 200000 })); //this changes the state of register so you need a fresh register for each test case
      await expect(primary.validate(bnd.send({ maxGas: 200000 }))).to.be.rejectedWith("The primary contract should be in initiated state");
    });  
  
  });

  describe("PrimaryIssuance Distribution from B&D", function () {
    before(async () => {
      await init();
    });

    it('PrimaryIssuance can only be deployed by BnD', async () => {
      //Only B&D role can deploy this contract
      await expect(allContracts.get(PrimaryIssuanceContractName).deploy(custodianA.newi({maxGas:1000000}), register.deployedAt, 1500)).to.be.rejectedWith(
        "Sender must be a B&D");
    }); 


    it("only B&D can finalize by calling primary.validate()", async () => {
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({ maxGas: 1000000 }), register.deployedAt, 1500);
      //Only B&D role can call the function finalize
      await expect(primary.validate(custodianA.send({ maxGas: 200000 }))).to.be.rejectedWith("Sender must be a B&D");
    });
    
    it("primary.status should be changed after validate() was called", async () => {
      // Given the B&D deploys a Primary Issuance contract
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({ maxGas: 1000000 }), register.deployedAt, 1500);
      // When the B&D finalize the transfer
      expect(await primary.status(bnd.call())).to.equal("1", "Status.Pending expected");
      await primary.validate(bnd.send({ maxGas: 200000 }));
      expect(await primary.status(bnd.call())).to.equal("3", "Status.Accepted expected");
    }); 

    it('should unit test each function - contract BilateralTrade - constructor - sender must be a valid investor ', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // The sender should be whitelisted
      await expect(allContracts.get(BilateralTradeContractName).deploy(wrongAccount.newi({maxGas:1000000}), register.deployedAt, await investorA.account())).to.be.rejectedWith("Sender must be a valid investor");
    });


    it('should unit test each function - contract BilateralTrade - constructor - buyer must be a valid investor', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // The buyer should be whitelisted
      await expect(allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await wrongAccount.account())).to.be.rejectedWith("Buyer must be a valid investor");
    });


    it('should unit test each function - contract BilateralTrade - function setDetails - only the seller can update this trade', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 155;
      details.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await expect(trade.setDetails(wrongAccount.send({maxGas:100000}), details)).to.be.rejectedWith("Only the seller can update this trade");

    });


    it('should unit test each function - contract BilateralTrade - function setDetails - Cannot change the trade details unless in draft status', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 155;
      details.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade.setDetails(bnd.send({maxGas:110000}), details);
      
      // When the B&D approve the trade
      const tx = await trade.approve(bnd.send({maxGas:100000}));

      await expect(trade.setDetails(bnd.send({maxGas:100000}), details)).to.be.rejectedWith("Cannot change the trade details unless in draft status");


    });



    it('should unit test each function - contract BilateralTrade - function setDetails - buyer must be a valid investor even on changing details', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 155;
      details.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade.setDetails(bnd.send({maxGas:110000}), details);

      details.buyer = await wrongAccount.account();

      await expect(trade.setDetails(bnd.send({maxGas:100000}), details)).to.be.rejectedWith("Buyer must be a valid investor even on changing details");

    });


    it('should unit test each function - contract BilateralTrade - function approve - quantity not defined', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 0;
      details.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade.setDetails(bnd.send({maxGas:100000}), details);
      
      // When the B&D approve the trade
      await expect(trade.approve(bnd.send({maxGas:100000}))).to.be.rejectedWith("quantity not defined");
      
    });


    it('should unit test each function - contract BilateralTrade - function approve - trade date not defined', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 187;
      details.tradeDate = 0;
      details.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade.setDetails(bnd.send({maxGas:100000}), details);
      
      // When the B&D approve the trade
      await expect(trade.approve(bnd.send({maxGas:100000}))).to.be.rejectedWith("trade date not defined");
      
    });


    it('should unit test each function - contract BilateralTrade - function approve - value date not defined', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 187;
      details.tradeDate = Date.UTC(2022, 14, 12) / (1000*3600*24);
      details.valueDate = 0;
      await trade.setDetails(bnd.send({maxGas:100000}), details);
      
      // When the B&D approve the trade
      await expect(trade.approve(bnd.send({maxGas:100000}))).to.be.rejectedWith("value date not defined");
      
    });


    it('should unit test each function - contract BilateralTrade - function approve - the trade cannot be approved in this current status', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract without setting details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 187;
      details.tradeDate = Date.UTC(2022, 14, 12) / (1000*3600*24);
      details.valueDate = Date.UTC(2022, 19, 12) / (1000*3600*24);
      await trade.setDetails(bnd.send({maxGas:110000}), details);

      // If the trade is approved
      await expect(trade.approve(bnd.send({maxGas:100000})));

      // If the trade is then rejected
      await expect(trade.reject(bnd.send({maxGas:100000})));

      // Then it can not been approved anymore because of its state
      await expect(trade.approve(bnd.send({maxGas:100000}))).to.be.rejectedWith("the trade cannot be approved in this current status");
      
    });


    it('should unit test each function - contract BilateralTrade - function approve - the trade cannot be rejected in this current status', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract without setting details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 187;
      details.tradeDate = Date.UTC(2022, 14, 12) / (1000*3600*24);
      details.valueDate = Date.UTC(2022, 19, 12) / (1000*3600*24);
      await trade.setDetails(bnd.send({maxGas:110000}), details);

      // If the trade is approved
      await expect(trade.approve(bnd.send({maxGas:100000})));

      // If the trade is then rejected
      await expect(trade.reject(bnd.send({maxGas:100000})));

      // Then it can not been rejected anymore because of its state
      await expect(trade.reject(bnd.send({maxGas:100000}))).to.be.rejectedWith(/Trade already rejected/);
      
    });


    it('should have the register initialized post issuance', async () => {

      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      // When the B&D finalize the transfer
      expect(await primary.status(bnd.call())).to.equal('1', "Pending status expected");
      await primary.validate(bnd.send({maxGas: 200000}));


      const isBnD = await register.isBnD(bnd.call(), await bnd.account());
      expect(isBnD).to.be.true;

      const balanceOfBnD = await register.balanceOf(cak.call(), await bnd.account());
      expect(balanceOfBnD).to.be.equal('1000');
    });
    
    
    it('should have the B&D prepare distribution to investor A', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 155;
      details.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade.setDetails(bnd.send({maxGas:110000}), details);
      
      // Then the trade to be propserly initialized
      expect(await trade.register(bnd.call())).to.equal(register.deployedAt);
      expect(await trade.sellerAccount(bnd.call())).to.equal(await bnd.account());
      expect(await trade.status(bnd.call())).to.equal('0');
      details = await trade.details(bnd.call());
      // console.log("Trade details", details);
      
      // When the B&D approve the trade
      const tx = await trade.approve(bnd.send({maxGas:100000}));
      // console.log((await web3.eth.getTransactionReceipt(tx)).logs);
      
      const log = await new Promise<EventData>( async resolve => {
        trade.events.NotifyTrade(investorA.get({fromBlock:0}), {buyer: await investorA.account()})
        .on("log", resolve);
      })
      // console.log("LOG:", log);

      // Then the trade should be ready for investor approval and an event been triggered
      expect(await trade.status(bnd.call())).to.equal('1');
      
    });

    
    it('should distribute the trade to investor A', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 155;
      details.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade.setDetails(bnd.send({maxGas:110000}), details);
      
      // Then the trade to be propserly initialized
      expect(await trade.register(bnd.call())).to.equal(register.deployedAt);
      expect(await trade.sellerAccount(bnd.call())).to.equal(await bnd.account());
      expect(await trade.status(bnd.call())).to.equal('0');
      details = await trade.details(bnd.call());
      
      // When the B&D approve the trade
      const tx1 = await trade.approve(bnd.send({maxGas:100000}));
      
      let log = await new Promise<EventData>( async resolve => {
        trade.events.NotifyTrade(investorA.get({fromBlock:0}), {buyer: await investorA.account()})
        .on("log", resolve);
      })

      // Then the trade should be ready for investor approval and an event been triggered
      expect(await trade.status(bnd.call())).to.equal('1');

      const tx2 = await await trade.approve(investorA.send({maxGas:200000}));
      //console.log((await web3.eth.getTransactionReceipt(tx2)).logs);

      log = await new Promise<EventData>( async resolve => {
        trade.events.NotifyTrade(investorA.get({fromBlock:0}), {buyer: await investorA.account()})
        .on("log", resolve);
      })

      let balanceOfInvestorA = await register.balanceOf(bnd.call(), await investorA.account());
      // the transfer should not have happen yet, waiting for payment reception (https://github.com/saturngroup/solution-monorepo/issues/403)
      expect(balanceOfInvestorA).to.equal('0'); 

      await trade.executeTransfer(bnd.send({maxGas: 500000}));

      balanceOfInvestorA = await register.balanceOf(bnd.call(), await investorA.account());
      expect(balanceOfInvestorA).to.equal(details.quantity);
    });



    it('should reject a trade by the buyer', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      let details = await trade.details(bnd.call());
      details.quantity = 155;
      details.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade.setDetails(bnd.send({maxGas:110000}), details);
      
      // Then the trade to be propserly initialized
      expect(await trade.register(bnd.call())).to.equal(register.deployedAt);
      expect(await trade.sellerAccount(bnd.call())).to.equal(await bnd.account());
      expect(await trade.status(bnd.call())).to.equal('0');
      details = await trade.details(bnd.call());
      
      // When the B&D approve the trade
      await trade.approve(bnd.send({maxGas:100000}));

      const tx1 = await trade.reject(bnd.send({maxGas:100000}));

      expect(await trade.status(bnd.call())).to.equal('2');

    });

    //reject trade by seller

    


    it('should distribute the trade to 2 more investors', async () => {
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));
      
      const balanceBeforeTrades = await register.balanceOf(bnd.call(), await bnd.account());
      
      // First trade trade1 for Investor B
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade1 = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorB.account());
      let details1 = await trade1.details(bnd.call());
      details1.quantity = 350;
      details1.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details1.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade1.setDetails(bnd.send({maxGas:200000}), details1);
      
      // Then the trade to be propserly initialized
      expect(await trade1.register(bnd.call())).to.equal(register.deployedAt);
      expect(await trade1.sellerAccount(bnd.call())).to.equal(await bnd.account());
      expect(await trade1.status(bnd.call())).to.equal('0');
      details1 = await trade1.details(bnd.call());
      
      // When the B&D approve the trade
      const tx1 = await trade1.approve(bnd.send({maxGas:200000}));
      
      // Then the trade should be ready for investor approval and an event been triggered
      expect(await trade1.status(bnd.call())).to.equal('1');
      
      await trade1.approve(investorB.send({maxGas:200000}));
      //console.log((await web3.eth.getTransactionReceipt(tx2)).logs);
      
      await trade1.executeTransfer(bnd.send({maxGas: 120000}));
      
      //const balanceOfInvestorB = await register.balanceOf(bnd.call(), await investorB.account());
      expect(await register.balanceOf(bnd.call(), await investorB.account())).to.equal(details1.quantity);


      // Second trade trade2 for Investor C
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade2 = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorC.account());
      let details2 = await trade2.details(bnd.call());


      details2.quantity = 230;
      details2.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details2.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade2.setDetails(bnd.send({maxGas:200000}), details2);
      
      // Then the trade to be propserly initialized
      expect(await trade2.register(bnd.call())).to.equal(register.deployedAt);
      expect(await trade2.sellerAccount(bnd.call())).to.equal(await bnd.account());
      expect(await trade2.status(bnd.call())).to.equal('0');
      details2 = await trade2.details(bnd.call());
      // console.log("Trade details", details2);
      
      // When the B&D approves the trade
      await trade2.approve(bnd.send({maxGas:200000}));
      expect(await trade2.status(bnd.call())).to.equal('1');
      await trade2.approve(investorC.send({maxGas:200000}));

      await trade2.executeTransfer(bnd.send({maxGas: 110000}));

      await register.balanceOf(bnd.call(), await investorC.account());
      expect(await register.balanceOf(bnd.call(), await investorC.account())).to.equal(details2.quantity);
      const sumTrades = parseInt(details1.quantity) + parseInt(details2.quantity);
      const balanceAfterTrades = balanceBeforeTrades - sumTrades;

      // console.log(balanceAfterTrades);

      expect(await register.balanceOf(bnd.call(), await bnd.account())).to.equal(balanceAfterTrades.toString());


    });



    // distribution to one more investor but trying to get more supply than B&D balance left

    it('should try to distribute the trade to one more investor but trade quantity too high', async () => {
      //FIXME: THIS TEST DEPENDS ON OTHERS TO PASS (bnd)
      // Given the B&D is registered and has purchased from the issuer
      const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 1500);
      await primary.validate(bnd.send({maxGas: 200000}));

      const balanceBeforeTrades = await register.balanceOf(bnd.call(), await bnd.account());
      expect(parseInt(balanceBeforeTrades)).to.lessThan(270,"review test case, bnd should have less than 270 for this test to work properly");
      
      // First trade trade1 for Investor B
      // When the B&D deploys a Bilateral Trade contract and sets details
      const trade3 = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorD.account());
      let details1 = await trade3.details(bnd.call());
      details1.quantity = 270;
      details1.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details1.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade3.setDetails(bnd.send({maxGas:110000}), details1);
      
      // Then the trade to be propserly initialized
      expect(await trade3.register(bnd.call())).to.equal(register.deployedAt);
      expect(await trade3.sellerAccount(bnd.call())).to.equal(await bnd.account());
      expect(await trade3.status(bnd.call())).to.equal('0');
      details1 = await trade3.details(bnd.call());
      // console.log("Trade details", details1);
      

      await trade3.approve(bnd.send({maxGas:100000}));
      await trade3.approve(investorD.send({maxGas:200000}))


      // Then the trade should be ready for investor approval and an event been triggered
      // console.log(await trade3.status(bnd.call()));

      await expect(trade3.executeTransfer(bnd.send({maxGas: 90000}))).to.be.rejectedWith("ERC20: transfer amount exceeds balance");

    });



  })

})