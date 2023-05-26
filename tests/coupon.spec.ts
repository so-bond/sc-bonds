import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import Web3 from "web3";
import Ganache from "ganache";
import { Web3FunctionProvider } from "@saturn-chain/web3-functions";
import { EthProviderInterface } from "@saturn-chain/dlt-tx-data-functions";
import allContracts from "../contracts";
import { SmartContract, SmartContractInstance } from "@saturn-chain/smart-contract";
import { blockGasLimit, makeReadyGas, registerGas } from "./gas.constant";
import { addPart, blockTimestamp, initWeb3Time, makeBondDate, makeDateTime, mineBlock } from "./dates";
import { closeEvents, collectEvents, getEvents } from "./events";

const RegisterContractName = "Register";
const PrimaryIssuanceContractName = "PrimaryIssuance";
const BilateralTradeContractName = "BilateralTrade";
const CouponTradeContractName = "Coupon";


describe("Run tests of the Coupon process", function () {
  this.timeout(10000);
  let web3: Web3;
  let cak: EthProviderInterface;
  let bnd: EthProviderInterface;
  let payer: EthProviderInterface;
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
  const maxGasAmount = 2000000;
  let firstCouponDate: number;
  let expectedSupply: number = 1000;


  async function init(): Promise<void> {
    web3 = new Web3(Ganache.provider({ default_balance_ether: 1000, gasLimit: blockGasLimit, chain: {vmErrorsOnRPCResponse:true} }) as any);
    initWeb3Time(web3);
    let gas: number;
    cak = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[0]));
    bnd = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[1]));
    payer = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[1]));

    custodianA = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[2]));
    custodianB = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[3]));
    investorA = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[4]));
    investorB = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[5]));
    investorC = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[6]));
    investorD = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[7]));
    wrongAccount = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[8]));

    const dates = makeBondDate(3, 2 * 24 * 3600)
    firstCouponDate = dates.couponDates[0];


    const bondName = "EIB 3Y 1Bn SEK";
    const isin = "EIB3Y";
    const currency = web3.utils.asciiToHex("SEK");
    const unitVal = 100000;
    const couponRate = 0.4 * 100 * 10_000;
    // const creationDate = 1309002208; //UTC
    // const issuanceDate = 1309102208; //UTC
    // const maturityDate = 1309202208; //UTC
    // const couponDates = [firstCouponDate, 1671408000, 1672358400]; //UTC [17/12/2022/0h, 19/12/2022/0h, 30/12/2022/0h]
    // const defaultCutofftime = 17 * 3600; //17:00

    if (allContracts.get(RegisterContractName)) {
      registerContract = allContracts.get(RegisterContractName);
      register = await registerContract.deploy(
        cak.newi({ maxGas: registerGas }),
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
    } else {
      throw new Error(RegisterContractName + " contract not defined in the compilation result");
    }
    await collectEvents(cak, register);
    
    //Grant all roles and whitelist addresses
    // await register.grantBndRole(cak.send({maxGas:100000}), await cak.account()); // needed to create a dummy primary issuance smart contract
    await register.grantBndRole(cak.send({maxGas:100000}), await bnd.account());
    await register.grantCstRole(cak.send({maxGas:100000}), await custodianA.account());
    await register.grantCstRole(cak.send({maxGas:100000}), await custodianB.account());

    await register.grantPayRole(cak.send({maxGas:100000}), await payer.account());

    // await register.enableInvestorToWhitelist(custodianA.send({maxGas:120000}), await cak.account()); // needed to deploy a test trade contract
    // await register.enableInvestorToWhitelist(custodianA.send({maxGas:120000}), await bnd.account()); // B&D must be an investor as well
    await register.enableInvestorToWhitelist(custodianA.send({maxGas:130000}), await investorA.account());
    await register.enableInvestorToWhitelist(custodianA.send({maxGas:130000}), await investorB.account());

    await register.enableInvestorToWhitelist(custodianB.send({maxGas:130000}), await investorC.account());
    await register.enableInvestorToWhitelist(custodianB.send({maxGas:130000}), await investorD.account());


    await register.setExpectedSupply(cak.send({maxGas:100000}),expectedSupply);
    await register.makeReady(cak.send({maxGas: makeReadyGas}));
    
    //initialization of he register  post issuance
    const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 100*10_000);
    
    await register.balanceOf(bnd.call(), await bnd.account());
    
    //whitelist primary issuance contract
    let hash1 = await register.atReturningHash(cak.call(), primary.deployedAt);
    await register.enableContractToWhitelist(cak.send({maxGas:120000}), hash1);
    
    gas = await primary.validate(bnd.test());
    await primary.validate(bnd.send({maxGas: gas}));
    
    //deploy bilateral trade
    const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
      
    let hash2 = await register.atReturningHash(cak.call(), trade.deployedAt);
    await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash2);

    let details = await trade.details(bnd.call());
    details.quantity = 155;
    details.tradeDate = addPart(dates.issuanceDate, "D", 1); //Date.UTC(2022, 9, 10) / (1000*3600*24);
    details.valueDate = addPart(dates.issuanceDate, "D", 2); //Date.UTC(2022, 9, 12) / (1000*3600*24);
    details.price = 101 * 10_000;
    gas = await trade.setDetails(bnd.test(), details);
    
    await trade.setDetails(bnd.send({maxGas:gas}), details);

    await trade.approve(bnd.send({maxGas:100000}));

    await trade.approve(investorA.send({maxGas:100000}));

    await trade.executeTransfer(bnd.send({maxGas:110000}));
  }


  describe("Coupon proces", function () {
    this.beforeEach(async () => {
      await init();

    });
    afterEach(() => {
      closeEvents();
    });

    it('should pass the initialization and check the status', async () => {
      getEvents(register).print()

      // The Bnd Balance should be equals to the expected full quantity
      // The total quantity in the register should be the expected quantity
      
      const totalSupply = Number.parseInt(await register.totalSupply(cak.call()))
      const bndBalance = Number.parseInt(await register.balanceOf(cak.call(), await bnd.account()))
      const invABalance = Number.parseInt(await register.balanceOf(cak.call(), await investorA.account()))
      const data = await register.getBondData(cak.call());
      // console.log("Check the balances", {totalSupply, bndBalance, expectedSupply, data});
      expect(totalSupply).to.equal(expectedSupply)
      expect(bndBalance + invABalance).to.equal(expectedSupply)
      expect(getEvents(register).has("RoleGranted", {})).to.equal(6)
    });

    it('should fail to deploy the coupon smart contract when the deployer has not the PAY role', async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;

      await expect(allContracts.get(CouponTradeContractName).deploy(cak.newi({maxGas:maxGasAmount}), register.deployedAt, firstCouponDate, 1500, firstCouponDate, 300000)).to.be.rejectedWith("Sender must be a Paying calculation agent");

      //function setDateAsCurrentCoupon()
    });

    it('should fail to deploy the coupon smart contract when the Coupon Date does not exist', async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;

      const p = allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:1000000}), register.deployedAt, addPart(firstCouponDate, "D", 1) , 1500, firstCouponDate, 300000)
      await expect(p).to.be.rejectedWith("this couponDate does not exists");

      //function setDateAsCurrentCoupon()
    });



    it('should deploy the coupon smart contract and check if Coupon Date exists', async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;
       
      const coupon = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, firstCouponDate, 1500, addPart(firstCouponDate, "D", -1), 8);

      //function setDateAsCurrentCoupon()
    });

    it("should deploy the coupon and get paymentID for an investor (max 16 hexa chars excluding 0x)", async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;
    
      const coupon = await allContracts
        .get(CouponTradeContractName)
        .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, firstCouponDate, 1500, addPart(firstCouponDate, "D", -1), 8);
      const investorAddress1 = await investorA.account();
      const concatenated = web3.utils.encodePacked(coupon.deployedAt, investorAddress1); //abi.encodePacked
      const expectedPaymentId = web3.utils.keccak256(concatenated ?? "").substring(0, 18);
    
      const actual = (await coupon.paymentIdForInvest(payer.call(), investorAddress1)) as string;
      expect(actual).to.equal(expectedPaymentId);
      expect(actual.substring(2).length).to.equal(16, "paymentId must be maximum 16 chars for Swift");
    });
    

    it('should deploy the coupon smart contract and initialize the status', async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;
       
      const coupon = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, firstCouponDate, 1500, addPart(firstCouponDate, "D", -1), 8);
      
      expect(await coupon.status(payer.call())).to.equal('0');
      //function setDateAsCurrentCoupon()
    });


    it("should fail when the paying calculation agent activate a coupon with a too old record date", async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;
    
      const couponDate = firstCouponDate; // 17 dec 2022 00:00:00
      const recordDate = addPart(firstCouponDate, "D", -11);
      const cutofftime = 55000; //15:16:40
      const coupon = await allContracts
        .get(CouponTradeContractName)
        .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, couponDate, 1500, recordDate, cutofftime);
    
      let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
      await register.enableContractToWhitelist(cak.send({ maxGas: 100000 }), hash);
    
      const p = coupon.setDateAsCurrentCoupon(payer.send({ maxGas: 300000 }));
    
      await expect(p).to.be.rejectedWith(/Inconsistent record date more than 10 days before settlement date/)
    });
    

    it("should enable the paying calculation agent to activate the coupon", async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;
    
      const couponDate = firstCouponDate; // 17 dec 2022 00:00:00
      const recordDate = addPart(firstCouponDate, "D", -1);
      const cutofftime = 55000; //15:16:40
      const expectedCurrentTS = recordDate + cutofftime;
      const coupon = await allContracts
        .get(CouponTradeContractName)
        .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, couponDate, 1500, recordDate, cutofftime);
    
      let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
      await register.enableContractToWhitelist(cak.send({ maxGas: 100000 }), hash);
    
      await coupon.setDateAsCurrentCoupon(payer.send({ maxGas: 300000 }));
    
      // //console.log("CURRENT COUPON DATE : " + await register.currentCouponDate(payer.call()));
      const actualCurrentTS = parseInt(await register.currentSnapshotDatetime(payer.call()));
      expect(actualCurrentTS).to.equal(expectedCurrentTS, "1671290200  couponDate + cutofftime expected");
    });
    


    it('should enable the paying calculation agent to set the number of days (nbDays)', async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;

      const couponDate = firstCouponDate;
       
      const coupon = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, 1500, addPart(firstCouponDate, "D", -1), 55000);
      
      let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);

      await coupon.setNbDays(payer.send({maxGas: 300000}), 360);

      // //console.log("CURRENT COUPON DATE : " + await register.currentCouponDate(payer.call()));

      // //console.log(couponDate);
      //FIXME: fix the test
      expect(await coupon.nbDays(payer.call())).to.equal("360");


      //expect(await register.currentCouponDate(payer.call())).to.equal(couponDate);
      //function setDateAsCurrentCoupon()
    });

    it('should enable the paying calculation agent to validate the coupon by calling setDateAsCurrentCoupon so that coupon status is set to Ready', async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;

      const couponDate = firstCouponDate;
       
      const coupon = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, 100, addPart(firstCouponDate, "D", -1), 8);
      
      let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);

      await coupon.setNbDays(payer.send({maxGas: 300000}), 360);

      expect(await coupon.nbDays(payer.call())).to.equal("360");

      // await coupon.validateCoupon(payer.send({maxGas: 300000}));
      await coupon.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation

      expect(await coupon.status(payer.call())).to.equal('1', "Coupon ready status expected after coupon validation");

    });




    it('should calculate the payment amount for an investor', async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;

      const couponDate = firstCouponDate;
       
      const coupon = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, 100, addPart(firstCouponDate, "D", -1), 8);
      
      let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);

      await coupon.setNbDays(payer.send({maxGas: 300000}), 360);

      expect(await coupon.nbDays(payer.call())).to.equal("360");

      // await coupon.validateCoupon(payer.send({maxGas: 300000}));
      await coupon.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation
      expect(await coupon.status(payer.call())).to.equal('1');


      let unitValue = await register.getBondUnitValue(cak.call());

      let couponRate = await register.getBondCouponRate(cak.call());

      let bal = await register.balanceOfCoupon(cak.call(), await investorA.account(), firstCouponDate);

      let payment = unitValue * couponRate * bal * 360 / 360;

      let couponPaymentForInvestor = await coupon.getPaymentAmountForInvestor(payer.call(), await investorA.account());
      
      expect(couponPaymentForInvestor).to.equal(payment.toString());
    });

    it('should calculate the payment amount for several investors ', async () => {

      //First trade is in init() function 
      //Given the second trade is created
      //deploy second bilateral trade for investor B
      const trade2 = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:2000000}), register.deployedAt, await investorB.account());
            
      //whitelist bilateral trade
      let hash2 = await register.atReturningHash(cak.call(), trade2.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:200000}), hash2);

      // set bilateral trade details
      let details2 = await trade2.details(bnd.call());
      details2.quantity = 130;
      details2.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details2.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade2.setDetails(bnd.send({maxGas:200000}), details2);

      //both 2 parties approve the trade
      await trade2.approve(bnd.send({maxGas:200000}));
      await trade2.approve(investorB.send({maxGas:200000}));
      await trade2.executeTransfer(bnd.send({maxGas:200000}));

      //test of the coupon
      let nbDaysInPeriod = 100;
      let cutOffTimeInSec = 16 * 3600;
      const couponDate = firstCouponDate;
       
      const coupon2 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, addPart(couponDate, "D", -1), cutOffTimeInSec);
      
      //whitelist of the coupon smart contract into the register
      let hash = await register.atReturningHash(cak.call(), coupon2.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:200000}), hash);

      //after the payer has set the nbDays
      await coupon2.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);
      expect(await coupon2.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      //and the payer has validated the coupon
      // await coupon2.validateCoupon(payer.send({maxGas: 300000}));
      await coupon2.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation
      expect(await coupon2.status(payer.call())).to.equal('1');


      let unitValue = await register.getBondUnitValue(cak.call());
      let couponRate = await register.getBondCouponRate(cak.call());
      let bal = await register.balanceOfCoupon(cak.call(), await investorB.account(), firstCouponDate);
      let payment = Math.floor(unitValue * couponRate * bal * nbDaysInPeriod / 360);

      //then the coupon calculates the payment amount for investor
      let couponPaymentForInvestor2 = await coupon2.getPaymentAmountForInvestor(payer.call(), await investorB.account());

      expect(couponPaymentForInvestor2).to.equal(payment.toString(), "couponPaymentForInvestor2 not properly calculated");

    

      //------------------------------------------------------------------------------------------------------------------------
      //First trade is in init() function 
      //Given the third trade is created
      //deploy second third trade for investor C
      const trade3 = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:2000000}), register.deployedAt, await investorC.account());
            
      //whitelist bilateral trade
      let hash3 = await register.atReturningHash(cak.call(), trade3.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:200000}), hash3);

      // set bilateral trade details
      let details3 = await trade3.details(bnd.call());
      details3.quantity = 125;
      details3.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details3.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade3.setDetails(bnd.send({maxGas:200000}), details3);

      //both 2 parties approve the trade
      await trade3.approve(bnd.send({maxGas:200000}));
      await trade3.approve(investorC.send({maxGas:200000}));
      await trade3.executeTransfer(bnd.send({maxGas:200000}));


      //test of the coupon
      const coupon3 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, addPart(couponDate, "D", -1), cutOffTimeInSec);
      
      hash3 = await register.atReturningHash(cak.call(), coupon3.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:200000}), hash3);

      await coupon3.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);

      expect(await coupon3.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      // await coupon3.validateCoupon(payer.send({maxGas: 300000}));
      await coupon3.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation
      expect(await coupon3.status(payer.call())).to.equal('1');


      unitValue = await register.getBondUnitValue(cak.call());
      couponRate = await register.getBondCouponRate(cak.call());
      bal = await register.balanceOfCoupon(cak.call(), await investorC.account(), firstCouponDate);
      payment = Math.floor(unitValue * couponRate * bal * nbDaysInPeriod / 360);

      //then the coupon calculates the payment amount for investor
      let couponPaymentForInvestor3 = await coupon3.getPaymentAmountForInvestor(payer.call(), await investorC.account());

      expect(couponPaymentForInvestor3).to.equal(payment.toString(), "couponPaymentForInvestor3 incorrectly calculated");



      //------------------------------------------------------------------------------------------------------------------------
      //First trade is in init() function 
      // Given the 4th trade is created
      //deploy the 4th bilateral trade for investor D
      const trade4 = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:2000000}), register.deployedAt, await investorD.account());
      
      //whitelist bilateral trade
      let hash4 = await register.atReturningHash(cak.call(), trade4.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:200000}), hash4);

      // set bilateral trade details
      let details4 = await trade4.details(bnd.call());
      details4.quantity = 100;
      details4.tradeDate = Date.UTC(2022, 9, 10) / (1000*3600*24);
      details4.valueDate = Date.UTC(2022, 9, 12) / (1000*3600*24);
      await trade4.setDetails(bnd.send({maxGas:200000}), details4);

      //both 2 parties approve the trade
      await trade4.approve(bnd.send({maxGas:200000}));
      await trade4.approve(investorD.send({maxGas:200000}));
      await trade4.executeTransfer(bnd.send({maxGas:200000}));

      //test of the coupon
      const coupon4 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, addPart(couponDate, "D", -1), cutOffTimeInSec);
      
      hash4 = await register.atReturningHash(cak.call(), coupon4.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:200000}), hash4);

      //after the payer has set the nbDays
      await coupon4.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);
      expect(await coupon4.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      //and the payer has validated the coupon
      // await coupon4.validateCoupon(payer.send({maxGas: 300000}));
      await coupon4.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation
      expect(await coupon4.status(payer.call())).to.equal('1');


      unitValue = await register.getBondUnitValue(cak.call());
      couponRate = await register.getBondCouponRate(cak.call());
      bal = await register.balanceOfCoupon(cak.call(), await investorD.account(), firstCouponDate);
      payment = Math.floor(unitValue * couponRate * bal * nbDaysInPeriod / 360);

      //then the coupon calculates the payment amount for investor
      let couponPaymentForInvestor4 = await coupon4.getPaymentAmountForInvestor(payer.call(), await investorD.account());

      expect(couponPaymentForInvestor4).to.equal(payment.toString());

      await collectEvents(payer, coupon2);
      getEvents(coupon2).print();

      // Investigate and test that the BnD is present in the investor list and that the total of the balance at coupon is the total issued amount
      // const investors: string[] = await register.getAllInvestors(payer.call())
      // console.log("List of investors", investors, "BnD:", await bnd.account());
      const investorsAtCoupon: string[] = await register.getInvestorListAtCoupon(payer.call(), couponDate);
      // console.log("List of investors at coupon",couponDate, investorsAtCoupon);
      expect(investorsAtCoupon).include(await bnd.account())
      const balancesAtCoupon = (await Promise.all(
        investorsAtCoupon.map(inv=> register.balanceOfCoupon(payer.call(), inv, couponDate))
      )).map( (bal, i)=>({address:investorsAtCoupon[i], bal: Number.parseInt(bal)}))
      // console.log("Balances at coupon", balancesAtCoupon);
      const totalBalance = balancesAtCoupon.reduce( (prev, current)=>prev+current.bal, 0)
      // console.log("total balance", totalBalance);
      expect(totalBalance).eq(expectedSupply);
    });

    it('should allow creating a coupon smart contract after the cutoff time', async () => {
      let couponDate = firstCouponDate;

      const timestamp = Number.parseInt(await register.currentSnapshotDatetime(payer.call()));
      let nbDaysInPeriod = 100;
      let cutOffTimeInSec = 18 * 3600; // 1h after the default cutOffTime

      
      //Given a first coupon is deployed
      const coupon = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, addPart(couponDate, "D", -1), cutOffTimeInSec);
      
      
      let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);

      // await coupon.validateCoupon(payer.send({maxGas: 300000}));
      await coupon.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation
      expect(await coupon.status(payer.call())).to.equal('1');
      
      // pass the cut off time
      await mineBlock(couponDate + cutOffTimeInSec + 1);
      // the transfert will create a snapshot
      await register.transferFrom(cak.send({maxGas:400000}), await bnd.account(), await investorB.account(), 100);
      
      // but should fail creating a coupon on the same date when the snapshot has already been taken
      const coupon2 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, addPart(couponDate, "D", -1), cutOffTimeInSec+100);
      await expect(coupon2.setDateAsCurrentCoupon(payer.send({maxGas: 300000}))).to.be.rejectedWith(/Date of coupon or maturity already taken/); 
      
      await collectEvents(cak, register);
      getEvents(register).print()

    });

    it('should deploy a second coupon and take snapshot of evolving balances', async () => {

      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;

      let couponDate = firstCouponDate;
      let recordDate = addPart(couponDate, "D", -1);

      let nbDaysInPeriod = 100;
      let cutOffTimeInSec = 17 * 3600;
      //Given a first coupon is deployed
      const coupon = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);


      let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);

      nbDaysInPeriod = 180;
      await coupon.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);

      expect(await coupon.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      // await coupon.validateCoupon(payer.send({maxGas: 300000}));
      await coupon.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation
      expect(await coupon.status(payer.call())).to.equal('1');

      //console.log("--------FIRST----------COUPON-------------");
      console.log("_currentSnapshotTimestamp : " + await register.currentSnapshotDatetime(cak.call()));
      console.log("_currentCouponDate : " + await register.currentCouponDate(cak.call()));
      //console.log("------------------------------------------");


      //We calculate the payment amount for the first coupon for investorA

      let unitValue = await register.getBondUnitValue(cak.call());
      let couponRate = await register.getBondCouponRate(cak.call());
      let balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), firstCouponDate);

      let paymentA = Math.floor(unitValue * couponRate * balA * nbDaysInPeriod / 360);

      //console.log("balance A : " + balA);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentA : " + paymentA.toString());


      let couponPaymentForInvestorA = await coupon.getPaymentAmountForInvestor(payer.call(), await investorA.account());


      //console.log("couponPaymentForInvestorA : " + couponPaymentForInvestorA);
      //console.log("------------------------------------------");
      

      //We then compare it to what the smart contract calculates
      expect(couponPaymentForInvestorA).to.equal(paymentA.toString());


      //We calculate the payment amount for the first coupon for investorB
      let balB = await register.balanceOfCoupon(cak.call(), await investorB.account(), firstCouponDate);
      let paymentB = Math.floor(unitValue * couponRate * balB * nbDaysInPeriod / 360);

      //console.log("balance B : " + balB);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentB: " + paymentB.toString());


      let couponPaymentForInvestorB = await coupon.getPaymentAmountForInvestor(payer.call(), await investorB.account());

      //console.log("couponPaymentForInvestorB : " + couponPaymentForInvestorB);
      //console.log("------------------------------------------");
      
      //We then compare it to what the smart contract calculates
      expect(couponPaymentForInvestorB).to.equal(paymentB.toString());



      console.log("--------TIME---------MACHINE-------------");
      //------------------------------------------------------------------------------------------------------------------
      console.log("block number before : " + await web3.eth.getBlockNumber(), await blockTimestamp());
      //------------------------------------------------------------------------------------------------------------------
      //Time machine advance 100 blocks

      //await passBlocks(100);
      await mineBlock(addPart(firstCouponDate, "D", -1) + cutOffTimeInSec + 5) // Move beyond the coupon date + cutOff Time


      console.log("block number after  : " + await web3.eth.getBlockNumber(), await blockTimestamp());
      //------------------------------------------------------------------------------------------------------------------
      //console.log("------------------------------------------");

      //Given a second coupon is deployed
      couponDate = firstCouponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, "D", -1);
      const coupon2 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);
      
      let balAbefore = await register.balanceOf(cak.call(), await investorA.account());
      let balBbefore = await register.balanceOf(cak.call(), await investorB.account());


      //do a transfer so the balance moves
      await (register.transferFrom(cak.send({ maxGas: 300_000 }), await investorA.account(), await investorB.account(), 12));

      console.log("balance Investor A before transferFrom : " + balAbefore);
      console.log("balance Investor A after transferFrom : " + await register.balanceOf(cak.call(), await investorA.account()));

      console.log("balance Investor B before transferFrom : " + balBbefore);
      console.log("balance Investor B after transferFrom : " + await register.balanceOf(cak.call(), await investorB.account()));
      //then we deploy a new coupon which couponDate takes place 2 days after
      // let hash2 = await register.atReturningHash(cak.call(), coupon2.deployedAt);

      //we whitelist this contract
      // await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);

      //we set ndDates and couponDate as current couponDate
      await coupon2.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);
      await coupon2.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation
      expect(await coupon2.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);
      // Should have generated a snapshot event
      getEvents(register).print()
      expect(getEvents(register).has("Snapshot", {id: "1"})).to.equal(1)


      //We validate this coupon
      // await coupon2.validateCoupon(payer.send({maxGas: 300000})); // done by setDateAsCurrentCoupon above

      expect(await coupon2.status(payer.call())).to.equal('1');

      //console.log("--------SECOND---------COUPON-------------");
      //console.log("_currentCouponDate : " + await register.currentSnapshotDatetime(cak.call()));
      //console.log("_currentCouponTimestamp : " + await register._currentCouponTimestamp(cak.call()));
      //console.log("------------------------------------------");

      //We calculate the payment amount for the second coupon for investorA
      balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), couponDate);


      unitValue = await register.getBondUnitValue(cak.call());
      couponRate = await register.getBondCouponRate(cak.call());
      // balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), firstCouponDate);

      paymentA = Math.floor(unitValue * couponRate * balA * nbDaysInPeriod / 360);

      console.log("balance A : " + balA);
      console.log("unitValue : " + unitValue);
      console.log("couponRate : " + couponRate);

      console.log("paymentA : " + paymentA.toString());



      couponPaymentForInvestorA = await coupon2.getPaymentAmountForInvestor(payer.call(), await investorA.account());
      
      //console.log("couponPaymentForInvestorA : " + couponPaymentForInvestorA);
      //console.log("------------------------------------------");

      expect(couponPaymentForInvestorA).to.equal(paymentA.toString(), "Invalid payment A");


      //We calculate the payment amount for the second coupon for investorB
      balB = await register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);
      paymentB = Math.floor(unitValue * couponRate * balB * nbDaysInPeriod / 360);
      couponPaymentForInvestorB = await coupon2.getPaymentAmountForInvestor(payer.call(), await investorB.account());
      
      expect(couponPaymentForInvestorB).to.equal(paymentB.toString());


      let balanceB = register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);

      //console.log("balance B : " + balB);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentB : " + paymentB.toString());

      //console.log("couponPaymentForInvestor2 : " + couponPaymentForInvestorB);
      //console.log("------------------------------------------");


      expect(await register.currentSnapshotDatetime(payer.call())).to.equal(`${makeDateTime(recordDate, cutOffTimeInSec)}`);



    });


    
    it('should deploy a third coupon, take snapshot of evolving balances for 3 investors', async () => {

      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;

      let couponDate = firstCouponDate;
      let recordDate = addPart(couponDate, "D", -1);

      let nbDaysInPeriod = 100;
      let cutOffTimeInSec = 17 * 3600;

      //Given a first coupon is deployed
      const coupon = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:maxGasAmount}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);
      
      let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);

      await coupon.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);

      expect(await coupon.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      // await coupon.validateCoupon(payer.send({maxGas: 300000}));
      await coupon.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation
      expect(await coupon.status(payer.call())).to.equal('1');

      //console.log("--------FIRST----------COUPON-------------");
      //console.log("_currentCouponDate : " + await register.currentSnapshotDatetime(cak.call()));
      //console.log("_currentCouponTimestamp : " + await register._currentCouponTimestamp(cak.call()));
      //console.log("------------------------------------------");


      //We calculate the payment amount for the first coupon for investorA

      let unitValue = await register.getBondUnitValue(cak.call());
      let couponRate = await register.getBondCouponRate(cak.call());
      let balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), firstCouponDate);

      let paymentA = Math.floor(unitValue * couponRate * balA * nbDaysInPeriod / 360);

      //console.log("balance A : " + balA);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentA : " + paymentA.toString());


      let couponPaymentForInvestorA = await coupon.getPaymentAmountForInvestor(payer.call(), await investorA.account());


      //console.log("couponPaymentForInvestorA : " + couponPaymentForInvestorA);
      //console.log("------------------------------------------");
      

      //We then compare it to what the smart contract calculates
      expect(couponPaymentForInvestorA).to.equal(paymentA.toString());


      //We calculate the payment amount for the first coupon for investorB
      let balB = await register.balanceOfCoupon(cak.call(), await investorB.account(), firstCouponDate);
      let paymentB = Math.floor(unitValue * couponRate * balB * nbDaysInPeriod / 360);

      //console.log("balance B : " + balB);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentB: " + paymentB.toString());


      let couponPaymentForInvestorB = await coupon.getPaymentAmountForInvestor(payer.call(), await investorB.account());

      //console.log("couponPaymentForInvestorB : " + couponPaymentForInvestorB);
      //console.log("------------------------------------------");
      
      //We then compare it to what the smart contract calculates
      expect(couponPaymentForInvestorB).to.equal(paymentB.toString());



      //We calculate the payment amount for the first coupon for investorC
      let balC = await register.balanceOfCoupon(cak.call(), await investorC.account(), firstCouponDate);
      let paymentC = Math.floor(unitValue * couponRate * balC * nbDaysInPeriod / 360);

      //console.log("balance C : " + balC);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentC: " + paymentC.toString());


      let couponPaymentForInvestorC = await coupon.getPaymentAmountForInvestor(payer.call(), await investorC.account());

      //console.log("couponPaymentForInvestorC : " + couponPaymentForInvestorC);
      //console.log("------------------------------------------");
      
      //We then compare it to what the smart contract calculates
      expect(couponPaymentForInvestorC).to.equal(paymentC.toString());

      //check balances before transfer 1
      let balB4Snapshot = [
        await register.balanceOf(cak.call(), await investorA.account()),
        await register.balanceOf(cak.call(), await investorB.account()),
        await register.balanceOf(cak.call(), await investorC.account())
      ];

      let balOfCoupon1Before = [
        await register.balanceOfCoupon(cak.call(), await investorA.account(), firstCouponDate),
        await register.balanceOfCoupon(cak.call(), await investorB.account(), firstCouponDate),
        await register.balanceOfCoupon(cak.call(), await investorC.account(), firstCouponDate)
      ];

      // the balances of coupon before the snapshot , before the end of the current period should be the current balance
      expect(balB4Snapshot[0]).to.equal(balOfCoupon1Before[0])
      expect(balB4Snapshot[1]).to.equal(balOfCoupon1Before[1])
      expect(balB4Snapshot[2]).to.equal(balOfCoupon1Before[2])


      //console.log("--------TIME---------MACHINE-------------");
      await mineBlock(recordDate + cutOffTimeInSec + 3600)

      //Given a second coupon is deployed
      couponDate = firstCouponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, "D", -1);
    
      const coupon2 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:maxGasAmount}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);

      //do a transfer 1 so the balance moves
      let gas = await register.transferFrom(cak.test(), await investorA.account(), await investorB.account(), 12)
      // the first transfer will trigger a snapshot
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorA.account(), await investorB.account(), 12));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorB.account(), await investorC.account(), 10));


      let balOfCoupon1After = [
        await register.balanceOfCoupon(cak.call(), await investorA.account(), firstCouponDate),
        await register.balanceOfCoupon(cak.call(), await investorB.account(), firstCouponDate),
        await register.balanceOfCoupon(cak.call(), await investorC.account(), firstCouponDate)
      ];
      let balOfCoupon2Before = [
        await register.balanceOfCoupon(cak.call(), await investorA.account(), couponDate),
        await register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate),
        await register.balanceOfCoupon(cak.call(), await investorC.account(), couponDate)
      ];
      let balAfterSnapshot = [
        await register.balanceOf(cak.call(), await investorA.account()),
        await register.balanceOf(cak.call(), await investorB.account()),
        await register.balanceOf(cak.call(), await investorC.account())
      ];

      // The balance of the first coupon after the snapshot has been taken should remain those before the snapshot
      expect(balOfCoupon1Before[0]).to.equal(balOfCoupon1After[0])
      expect(balOfCoupon1Before[1]).to.equal(balOfCoupon1After[1])
      expect(balOfCoupon1Before[2]).to.equal(balOfCoupon1After[2])
      
      // The balance of the second coupon should be the current balances
      expect(balOfCoupon2Before[0]).to.equal(balAfterSnapshot[0])
      expect(balOfCoupon2Before[1]).to.equal(balAfterSnapshot[1])
      expect(balOfCoupon2Before[2]).to.equal(balAfterSnapshot[2])

      // //check balances before transfer 2
      // let balAbeforetransfer2 = await register.balanceOf(cak.call(), await investorA.account());
      // let balBbeforetransfer2 = await register.balanceOf(cak.call(), await investorB.account());
      // let balCbeforetransfer2 = await register.balanceOf(cak.call(), await investorC.account());

      // //do a transfer 2 so the balance moves
      // await (register.transferFrom(cak.send({ maxGas: gas }), await investorA.account(), await investorB.account(), 12));
      // await (register.transferFrom(cak.send({ maxGas: gas }), await investorB.account(), await investorC.account(), 10));
      // await (register.transferFrom(cak.send({ maxGas: gas }), await investorC.account(), await investorA.account(), 7));     

      // getEvents(register).print();
      expect(getEvents(register).has("Snapshot", {id: "1"})).equal(1)

      //check the balances of investors A,B,C before and after transfers 1&2
      //console.log("balance Investor A before transferFrom 1 : " + balAbeforetransfer1);
      //console.log("balance Investor A after transferFrom 1 : " + balAbeforetransfer2);
      //console.log("balance Investor A after transferFrom 2 : " + await register.balanceOf(cak.call(), await investorA.account()));
      //console.log("------------------------------------------");
      //console.log("balance Investor B before transferFrom 1 : " + balBbeforetransfer1);
      //console.log("balance Investor B before transferFrom 1 : " + balBbeforetransfer2);
      //console.log("balance Investor B after transferFrom 2 : " + await register.balanceOf(cak.call(), await investorB.account()));
      //console.log("------------------------------------------");
      //console.log("balance Investor C before transferFrom 1 : " + balCbeforetransfer1);
      //console.log("balance Investor C before transferFrom 1 : " + balCbeforetransfer2);
      //console.log("balance Investor C after transferFrom 2 : " + await register.balanceOf(cak.call(), await investorC.account()));


      //then we deploy a new coupon which couponDate takes place 2 days after
      // let hash2 = await register.atReturningHash(cak.call(), coupon2.deployedAt);

      //we whitelist this contract
      // await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash2);

      //we set ndDates and couponDate as current couponDate
      await coupon2.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);
      await coupon2.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); //implicit coupon validation
      expect(await coupon2.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      //We validate this coupon
      // await coupon2.validateCoupon(payer.send({maxGas: 300000})); // already validated by calling setDateAsCurrentCoupon above
      expect(await coupon2.status(payer.call())).to.equal('1');

      //console.log("--------SECOND---------COUPON-------------");
      //console.log("_currentCouponDate : " + await register.currentSnapshotDatetime(cak.call()));
      //console.log("_currentCouponTimestamp : " + await register._currentCouponTimestamp(cak.call()));
      //console.log("------------------------------------------");


      //We calculate the payment amount for the second coupon for investorA
      balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), couponDate);

      unitValue = await register.getBondUnitValue(cak.call());
      couponRate = await register.getBondCouponRate(cak.call());
      // balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), firstCouponDate);

      paymentA = Math.floor(unitValue * couponRate * balA * nbDaysInPeriod / 360);

      //console.log("balance A : " + balA);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentA : " + paymentA.toString());



      couponPaymentForInvestorA = await coupon2.getPaymentAmountForInvestor(payer.call(), await investorA.account());
      
      //console.log("couponPaymentForInvestorA : " + couponPaymentForInvestorA);
      //console.log("------------------------------------------");

      expect(couponPaymentForInvestorA).to.equal(paymentA.toString());


      //We calculate the payment amount for the second coupon for investorB
      balB = await register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);
      paymentB = Math.floor(unitValue * couponRate * balB * nbDaysInPeriod / 360);
      couponPaymentForInvestorB = await coupon2.getPaymentAmountForInvestor(payer.call(), await investorB.account());
      
      expect(couponPaymentForInvestorB).to.equal(paymentB.toString());


      let balanceB = register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);

      //console.log("balance B : " + balB);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentB : " + paymentB.toString());

      //console.log("couponPaymentForInvestorB : " + couponPaymentForInvestorB);
      //console.log("------------------------------------------");




      //We calculate the payment amount for the second coupon for investorC
      balC = await register.balanceOfCoupon(cak.call(), await investorC.account(), couponDate);
      paymentC = Math.floor(unitValue * couponRate * balC * nbDaysInPeriod / 360);
      couponPaymentForInvestorC = await coupon2.getPaymentAmountForInvestor(payer.call(), await investorC.account());
      
      expect(couponPaymentForInvestorC).to.equal(paymentC.toString());


      let balanceC = register.balanceOfCoupon(cak.call(), await investorC.account(), couponDate);

      //console.log("balance C : " + balC);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentC : " + paymentC.toString());

      //console.log("couponPaymentForInvestorC : " + couponPaymentForInvestorC);
      //console.log("------------------------------------------");





      //console.log("--------TIME---------MACHINE-------------");
      //------------------------------------------------------------------------------------------------------------------
      //console.log("block number before : " + await web3.eth.getBlockNumber());
      //------------------------------------------------------------------------------------------------------------------
      //Time machine advance 100 blocks
      await mineBlock(recordDate + cutOffTimeInSec + 3600)
      //console.log("block number after : " + await web3.eth.getBlockNumber());
      //------------------------------------------------------------------------------------------------------------------
      //console.log("------------------------------------------");

      //Given a second coupon is deployed
      couponDate = couponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, "D", -1);

      const coupon3 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:maxGasAmount}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);
      
      //check balances before transfer 1
      let balAbeforetransfer3 = await register.balanceOf(cak.call(), await investorA.account());
      let balBbeforetransfer3 = await register.balanceOf(cak.call(), await investorB.account());
      let balCbeforetransfer3 = await register.balanceOf(cak.call(), await investorC.account());


      //do a transfer 1 so the balance moves
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorA.account(), await investorB.account(), 23));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorB.account(), await investorC.account(), 18));



      //check balances before transfer 2
      let balAbeforetransfer4 = await register.balanceOf(cak.call(), await investorA.account());
      let balBbeforetransfer4 = await register.balanceOf(cak.call(), await investorB.account());
      let balCbeforetransfer4 = await register.balanceOf(cak.call(), await investorC.account());

      //do a transfer 2 so the balance moves
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorA.account(), await investorB.account(), 2));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorB.account(), await investorC.account(), 3));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorC.account(), await investorA.account(), 6));     


      //check the balances of investors A,B,C before and after transfers 1&2
      //console.log("balance Investor A before transferFrom 3 : " + balAbeforetransfer3);
      //console.log("balance Investor A after transferFrom 3 : " + balAbeforetransfer4);
      //console.log("balance Investor A after transferFrom 4 : " + await register.balanceOf(cak.call(), await investorA.account()));
      //console.log("------------------------------------------");
      //console.log("balance Investor B before transferFrom 3 : " + balBbeforetransfer3);
      //console.log("balance Investor B before transferFrom 3 : " + balBbeforetransfer4);
      //console.log("balance Investor B after transferFrom 4 : " + await register.balanceOf(cak.call(), await investorB.account()));
      //console.log("------------------------------------------");
      //console.log("balance Investor C before transferFrom 3 : " + balCbeforetransfer3);
      //console.log("balance Investor C before transferFrom 3 : " + balCbeforetransfer4);
      //console.log("balance Investor C after transferFrom 4 : " + await register.balanceOf(cak.call(), await investorC.account()));


      //then we deploy a new coupon which couponDate takes place 2 days after
      // let hash3 = await register.atReturningHash(cak.call(), coupon2.deployedAt);

      //we whitelist this contract
      // await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash3);

      //we set ndDates and couponDate as current couponDate
      await coupon3.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);
      await coupon3.setDateAsCurrentCoupon(payer.send({maxGas: 300000}));  //implicit coupon validation
      expect(await coupon3.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      //We validate this coupon
      // await coupon3.validateCoupon(payer.send({maxGas: 300000})); // already validated by calling setDateAsCurrentCoupon above
      expect(await coupon3.status(payer.call())).to.equal('1');

      //console.log("--------THIRD---------COUPON-------------");
      //console.log("_currentCouponDate : " + await register.currentSnapshotDatetime(cak.call()));
      //console.log("_currentCouponTimestamp : " + await register._currentCouponTimestamp(cak.call()));
      //console.log("------------------------------------------");


      //We calculate the payment amount for the second coupon for investorA
      balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), couponDate);


      unitValue = await register.getBondUnitValue(cak.call());
      couponRate = await register.getBondCouponRate(cak.call());
      // balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), firstCouponDate);

      paymentA = Math.floor(unitValue * couponRate * balA * nbDaysInPeriod / 360);

      //console.log("balance A : " + balA);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentA : " + paymentA.toString());



      couponPaymentForInvestorA = await coupon3.getPaymentAmountForInvestor(payer.call(), await investorA.account());
      
      //console.log("couponPaymentForInvestorA : " + couponPaymentForInvestorA);
      //console.log("------------------------------------------");

      expect(couponPaymentForInvestorA).to.equal(paymentA.toString());


      //We calculate the payment amount for the second coupon for investorB
      balB = await register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);
      paymentB = Math.floor(unitValue * couponRate * balB * nbDaysInPeriod / 360);
      couponPaymentForInvestorB = await coupon3.getPaymentAmountForInvestor(payer.call(), await investorB.account());
      
      expect(couponPaymentForInvestorB).to.equal(paymentB.toString());


      balanceB = register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);

      //console.log("balance B : " + balB);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentB : " + paymentB.toString());

      //console.log("couponPaymentForInvestorB : " + couponPaymentForInvestorB);
      //console.log("------------------------------------------");




      //We calculate the payment amount for the second coupon for investorC
      balC = await register.balanceOfCoupon(cak.call(), await investorC.account(), couponDate);
      paymentC = Math.floor(unitValue * couponRate * balC * nbDaysInPeriod / 360);
      couponPaymentForInvestorC = await coupon3.getPaymentAmountForInvestor(payer.call(), await investorC.account());
      
      expect(couponPaymentForInvestorC).to.equal(paymentC.toString());


      balanceC = register.balanceOfCoupon(cak.call(), await investorC.account(), couponDate);

      //console.log("balance C : " + balC);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentC : " + paymentC.toString());

      //console.log("couponPaymentForInvestorC : " + couponPaymentForInvestorC);
      //console.log("------------------------------------------");


      expect(await register.currentSnapshotDatetime(payer.call())).to.equal(`${makeDateTime(recordDate, cutOffTimeInSec)}`);

  
      


    });




    it('should deploy a third coupon, take snapshot of evolving balances for 3 investors make payment Ready, close coupon and finalize it', async () => {

      let gas: number;
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;

      let couponDate = firstCouponDate;
      let recordDate = addPart(couponDate, "D", -1);

      let nbDaysInPeriod = 100;
      let cutOffTimeInSec = 17 * 3600;


      //Given a first coupon is deployed
      const coupon4 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);
      
      let hash = await register.atReturningHash(cak.call(), coupon4.deployedAt);
      await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);

      //console.log("Coupon status : " + await coupon.status(payer.call()));

      await coupon4.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);

      await coupon4.setDateAsCurrentCoupon(payer.send({maxGas: 300000}));  //implicit coupon validation

      //console.log("Coupon status : " + await coupon.status(payer.call()));

      expect(await coupon4.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      // await coupon.validateCoupon(payer.send({maxGas: 300000}));
      // await coupon.setDateAsCurrentCoupon(payer.send({maxGas: 300000})); coupon already validated above (setDateAsCurrentCoupon)
      expect(await coupon4.status(payer.call())).to.equal('1');


      // //console.log("--------FIRST----------COUPON-------------");
      //console.log("_currentCouponDate : " + await register.currentSnapshotDatetime(cak.call()));
      //console.log("_currentCouponTimestamp : " + await register._currentCouponTimestamp(cak.call()));
      //console.log("------------------------------------------");

      //do a transfer 1 so the balance moves
      await (register.transferFrom(cak.send({ maxGas: 130000 }), await investorA.account(), await investorB.account(), 50));
      await (register.transferFrom(cak.send({ maxGas: 130000 }), await investorB.account(), await investorC.account(), 17));

      //We calculate the payment amount for the first coupon for investorA

      let unitValue = await register.getBondUnitValue(cak.call());
      let couponRate = await register.getBondCouponRate(cak.call());
      let balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), couponDate);

      let paymentA = Math.floor(unitValue * couponRate * balA * nbDaysInPeriod / 360);

      //console.log("balance A : " + balA);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentA : " + paymentA.toString());


      let couponPaymentForInvestorA = await coupon4.getPaymentAmountForInvestor(payer.call(), await investorA.account());


      //console.log("couponPaymentForInvestorA : " + couponPaymentForInvestorA);
      //console.log("------------------------------------------");
      

      //We then compare it to what the smart contract calculates
      expect(couponPaymentForInvestorA).to.equal(paymentA.toString());

      await mineBlock(recordDate + cutOffTimeInSec + 1);

      await coupon4.toggleCouponPayment(cak.send({maxGas:100000}), await investorA.account());

      //console.log("investorPayments A : " + await coupon.getInvestorPayments(payer.call(), await investorA.account()));

      //console.log("------------------------------------------");

      


      //We calculate the payment amount for the first coupon for investorB
      let balB = await register.balanceOfCoupon(cak.call(), await investorB.account(), firstCouponDate);
      let paymentB = Math.floor(unitValue * couponRate * balB * nbDaysInPeriod / 360);

      //console.log("balance B : " + balB);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentB: " + paymentB.toString());


      let couponPaymentForInvestorB = await coupon4.getPaymentAmountForInvestor(payer.call(), await investorB.account());

      //console.log("couponPaymentForInvestorB : " + couponPaymentForInvestorB);
      //console.log("------------------------------------------");
      
      //We then compare it to what the smart contract calculates
      expect(couponPaymentForInvestorB).to.equal(paymentB.toString());



      await coupon4.toggleCouponPayment(cak.send({maxGas:100000}), await investorB.account());

      //console.log("investorPayments B: " + await coupon.getInvestorPayments(payer.call(), await investorB.account()));


      //console.log("------------------------------------------");

      //We calculate the payment amount for the first coupon for investorC
      let balC = await register.balanceOfCoupon(cak.call(), await investorC.account(), firstCouponDate);
      let paymentC = Math.floor(unitValue * couponRate * balC * nbDaysInPeriod / 360);

      //console.log("balance C : " + balC);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentC: " + paymentC.toString());


      let couponPaymentForInvestorC = await coupon4.getPaymentAmountForInvestor(payer.call(), await investorC.account());

      //console.log("couponPaymentForInvestorC : " + couponPaymentForInvestorC);
      //console.log("------------------------------------------");
      
      //We then compare it to what the smart contract calculates
      expect(couponPaymentForInvestorC).to.equal(paymentC.toString());

      await coupon4.toggleCouponPayment(cak.send({maxGas:100000}), await investorC.account());

      await coupon4.toggleCouponPayment(cak.send({maxGas:100000}), await investorD.account());

      //console.log("investorPayments C : " + await coupon.getInvestorPayments(payer.call(), await investorC.account()));

      //console.log("------------------------------------------");

      //as bnd is in the list of investors, we make the payment ready, so we can finalize the coupon
      // await coupon4.toggleCouponPayment(payer.send({maxGas:100000}), await bnd.account()); // not an investor anymore



      //console.log("Coupon status after finalize " + await coupon.status(payer.call()));

      ////console.log(await coupon.status(payer.call())).to.equal('5');

      //console.log(await register.getInvestorListAtCoupon(payer.call(),couponDate));

      //console.log("investor A : " + await investorA.account());
      //console.log("investor B : " + await investorB.account());
      //console.log("investor C : " + await investorC.account());
      //console.log("investor D : " + await investorD.account());
      //console.log("bnd : " + await bnd.account());

      //console.log("payment investor A : " + await coupon4.getInvestorPayments(payer.call(), await investorA.account()));
      //console.log("payment investor B : " + await coupon4.getInvestorPayments(payer.call(), await investorB.account()));
      //console.log("payment investor C : " + await coupon4.getInvestorPayments(payer.call(), await investorC.account()));
      //console.log("payment investor D : " + await coupon4.getInvestorPayments(payer.call(), await investorD.account()));
      //console.log("payment bnd: " + await coupon4.getInvestorPayments(payer.call(), await bnd.account()));
      //console.log("------------------------------------------");

      
      // await coupon4.finalizeCoupon(payer.send({maxGas:100000}));
      
      // TODO: Set the Coupon status to Closed automatically when all investors get paid.
      // The CLosed status would now be 3
      // expect(await coupon4.status(payer.call())).to.equal('3');


      

      //console.log("--------TIME---------MACHINE-------------");
      //------------------------------------------------------------------------------------------------------------------
      //console.log("block number before : " + await web3.eth.getBlockNumber());
      //------------------------------------------------------------------------------------------------------------------
      //Time machine advance 100 blocks



      await mineBlock(recordDate + cutOffTimeInSec + 3600)

      //console.log("block number after : " + await web3.eth.getBlockNumber());
      //------------------------------------------------------------------------------------------------------------------
      //console.log("------------------------------------------");

      //Given a second coupon is deployed
      couponDate = couponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, "D", -1);

      const coupon5 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:maxGasAmount}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);
      
      //check balances before transfer 1
      let balAbeforetransfer1 = await register.balanceOf(cak.call(), await investorA.account());
      let balBbeforetransfer1 = await register.balanceOf(cak.call(), await investorB.account());
      let balCbeforetransfer1 = await register.balanceOf(cak.call(), await investorC.account());


      //do a transfer 1 so the balance moves
      gas = await register.transferFrom(cak.test(), await investorA.account(), await investorB.account(), 12)
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorA.account(), await investorB.account(), 12));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorB.account(), await investorC.account(), 10));



      //check balances before transfer 2
      let balAbeforetransfer2 = await register.balanceOf(cak.call(), await investorA.account());
      let balBbeforetransfer2 = await register.balanceOf(cak.call(), await investorB.account());
      let balCbeforetransfer2 = await register.balanceOf(cak.call(), await investorC.account());

      //do a transfer 2 so the balance moves
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorA.account(), await investorB.account(), 12));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorB.account(), await investorC.account(), 10));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorC.account(), await investorA.account(), 7));     


      //check the balances of investors A,B,C before and after transfers 1&2
      //console.log("balance Investor A before transferFrom 1 : " + balAbeforetransfer1);
      //console.log("balance Investor A after transferFrom 1 : " + balAbeforetransfer2);
      //console.log("balance Investor A after transferFrom 2 : " + await register.balanceOf(cak.call(), await investorA.account()));
      //console.log("------------------------------------------");
      //console.log("balance Investor B before transferFrom 1 : " + balBbeforetransfer1);
      //console.log("balance Investor B before transferFrom 1 : " + balBbeforetransfer2);
      //console.log("balance Investor B after transferFrom 2 : " + await register.balanceOf(cak.call(), await investorB.account()));
      //console.log("------------------------------------------");
      //console.log("balance Investor C before transferFrom 1 : " + balCbeforetransfer1);
      //console.log("balance Investor C before transferFrom 1 : " + balCbeforetransfer2);
      //console.log("balance Investor C after transferFrom 2 : " + await register.balanceOf(cak.call(), await investorC.account()));


      //then we deploy a new coupon which couponDate takes place 2 days after
      // let hash2 = await register.atReturningHash(cak.call(), coupon5.deployedAt);

      //we whitelist this contract
      // await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash2);

      //we set ndDates and couponDate as current couponDate

      await coupon5.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);
      expect(await coupon5.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      await coupon5.setDateAsCurrentCoupon(payer.send({maxGas: 300000}));

      expect(await coupon5.status(payer.call())).to.equal('1');

      //console.log("--------SECOND---------COUPON-------------");
      //console.log("_currentCouponDate : " + await register.currentSnapshotDatetime(cak.call()));
      //console.log("_currentCouponTimestamp : " + await register._currentCouponTimestamp(cak.call()));
      //console.log("------------------------------------------");


      //We calculate the payment amount for the second coupon for investorA
      balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), couponDate);


      unitValue = await register.getBondUnitValue(cak.call());
      couponRate = await register.getBondCouponRate(cak.call());

      paymentA = Math.floor(unitValue * couponRate * balA * nbDaysInPeriod / 360);

      //console.log("balance A : " + balA);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentA : " + paymentA.toString());



      couponPaymentForInvestorA = await coupon5.getPaymentAmountForInvestor(payer.call(), await investorA.account());
      
      //console.log("couponPaymentForInvestorA : " + couponPaymentForInvestorA);
      //console.log("------------------------------------------");

      expect(couponPaymentForInvestorA).to.equal(paymentA.toString());

      await mineBlock(recordDate + cutOffTimeInSec + 1);

      await coupon5.toggleCouponPayment(cak.send({maxGas:100000}), await investorA.account());

      //console.log("investorPayments A: " + await coupon.getInvestorPayments(payer.call(), await investorA.account()));


      //console.log("------------------------------------------");


      //We calculate the payment amount for the second coupon for investorB
      balB = await register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);
      paymentB = Math.floor(unitValue * couponRate * balB * nbDaysInPeriod / 360);
      couponPaymentForInvestorB = await coupon5.getPaymentAmountForInvestor(payer.call(), await investorB.account());
      
      expect(couponPaymentForInvestorB).to.equal(paymentB.toString());


      await coupon5.toggleCouponPayment(cak.send({maxGas:100000}), await investorB.account());

      //console.log("investorPayments B: " + await coupon2.getInvestorPayments(payer.call(), await investorB.account()));


      //console.log("------------------------------------------");


      let balanceB = register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);

      //console.log("balance B : " + balB);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentB : " + paymentB.toString());

      //console.log("couponPaymentForInvestorB : " + couponPaymentForInvestorB);
      //console.log("------------------------------------------");




      //We calculate the payment amount for the second coupon for investorC
      balC = await register.balanceOfCoupon(cak.call(), await investorC.account(), couponDate);
      paymentC = Math.floor(unitValue * couponRate * balC * nbDaysInPeriod / 360);
      couponPaymentForInvestorC = await coupon5.getPaymentAmountForInvestor(payer.call(), await investorC.account());
      
      expect(couponPaymentForInvestorC).to.equal(paymentC.toString());


      await coupon5.toggleCouponPayment(cak.send({maxGas:100000}), await investorC.account());

      await coupon5.toggleCouponPayment(cak.send({maxGas:100000}), await investorD.account());

      //console.log("investorPayments C : " + await coupon2.getInvestorPayments(payer.call(), await investorC.account()));

      //console.log("------------------------------------------");

      //as bnd is in the list of investors, we make the payment ready, so we can finalize the coupon
      // await coupon5.toggleCouponPayment(payer.send({maxGas:100000}), await bnd.account()); // not an investor

  

      //onsole.log(await register.getInvestorListAtCoupon(payer.call(),couponDate));

      //console.log("investor A : " + await investorA.account());
      //console.log("investor B : " + await investorB.account());
      //console.log("investor C : " + await investorC.account());
      //console.log("bnd : " + await bnd.account());

      //console.log("------------------------------------------");
      // await coupon5.finalizeCoupon(payer.send({maxGas:100000}));
  
      // TODO: Close the Coupon after all payments, check Closed status to 3
      // expect(await coupon5.status(payer.call())).to.equal('3');



      //console.log("--------TIME---------MACHINE-------------");
      //------------------------------------------------------------------------------------------------------------------
      //console.log("block number before : " + await web3.eth.getBlockNumber());
      //------------------------------------------------------------------------------------------------------------------
      //Time machine advance 100 blocks
      await mineBlock(recordDate + cutOffTimeInSec + 3600)
      //console.log("block number after : " + await web3.eth.getBlockNumber());
      //------------------------------------------------------------------------------------------------------------------
      //console.log("------------------------------------------");

      //Given a second coupon is deployed
      couponDate = couponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, "D", -1);

      const coupon6 = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:maxGasAmount}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);
      
      //check balances before transfer 1
      let balAbeforetransfer3 = await register.balanceOf(cak.call(), await investorA.account());
      let balBbeforetransfer3 = await register.balanceOf(cak.call(), await investorB.account());
      let balCbeforetransfer3 = await register.balanceOf(cak.call(), await investorC.account());


      //do a transfer 1 so the balance moves
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorA.account(), await investorB.account(), 23));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorB.account(), await investorC.account(), 18));



      //check balances before transfer 2
      let balAbeforetransfer4 = await register.balanceOf(cak.call(), await investorA.account());
      let balBbeforetransfer4 = await register.balanceOf(cak.call(), await investorB.account());
      let balCbeforetransfer4 = await register.balanceOf(cak.call(), await investorC.account());

      //do a transfer 2 so the balance moves
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorA.account(), await investorB.account(), 2));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorB.account(), await investorC.account(), 3));
      await (register.transferFrom(cak.send({ maxGas: gas }), await investorC.account(), await investorA.account(), 6));     


      //check the balances of investors A,B,C before and after transfers 1&2
      //console.log("balance Investor A before transferFrom 3 : " + balAbeforetransfer3);
      //console.log("balance Investor A after transferFrom 3 : " + balAbeforetransfer4);
      //console.log("balance Investor A after transferFrom 4 : " + await register.balanceOf(cak.call(), await investorA.account()));
      //console.log("------------------------------------------");
      //console.log("balance Investor B before transferFrom 3 : " + balBbeforetransfer3);
      //console.log("balance Investor B before transferFrom 3 : " + balBbeforetransfer4);
      //console.log("balance Investor B after transferFrom 4 : " + await register.balanceOf(cak.call(), await investorB.account()));
      //console.log("------------------------------------------");
      //console.log("balance Investor C before transferFrom 3 : " + balCbeforetransfer3);
      //console.log("balance Investor C before transferFrom 3 : " + balCbeforetransfer4);
      //console.log("balance Investor C after transferFrom 4 : " + await register.balanceOf(cak.call(), await investorC.account()));


      //then we deploy a new coupon which couponDate takes place 2 days after
      // let hash3 = await register.atReturningHash(cak.call(), coupon6.deployedAt);

      //we whitelist this contract
      // await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash3);

      //we set ndDates and couponDate as current couponDate

      await coupon6.setNbDays(payer.send({maxGas: 300000}), nbDaysInPeriod);
      expect(await coupon6.nbDays(payer.call())).to.equal(`${nbDaysInPeriod}`);

      await coupon6.setDateAsCurrentCoupon(payer.send({maxGas: 300000}));

      expect(await coupon6.status(payer.call())).to.equal('1');

      //console.log("--------THIRD---------COUPON-------------");
      //console.log("_currentCouponDate : " + await register.currentSnapshotDatetime(cak.call()));
      //console.log("_currentCouponTimestamp : " + await register._currentCouponTimestamp(cak.call()));
      //console.log("------------------------------------------");


      //We calculate the payment amount for the second coupon for investorA
      balA = await register.balanceOfCoupon(cak.call(), await investorA.account(), couponDate);

 
      unitValue = await register.getBondUnitValue(cak.call());
      couponRate = await register.getBondCouponRate(cak.call());

      paymentA = Math.floor(unitValue * couponRate * balA * nbDaysInPeriod / 360);

      //console.log("balance A : " + balA);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentA : " + paymentA.toString());



      couponPaymentForInvestorA = await coupon6.getPaymentAmountForInvestor(payer.call(), await investorA.account());
      
      //console.log("couponPaymentForInvestorA : " + couponPaymentForInvestorA);
      //console.log("------------------------------------------");

      expect(couponPaymentForInvestorA).to.equal(paymentA.toString());
      
      await mineBlock(recordDate + cutOffTimeInSec + 1)

      await coupon6.toggleCouponPayment(cak.send({maxGas:100000}), await investorA.account());

      //console.log("investorPayments A: " + await coupon3.getInvestorPayments(payer.call(), await investorA.account()));


      //console.log("------------------------------------------");


      //We calculate the payment amount for the second coupon for investorB
      balB = await register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);
      paymentB = Math.floor(unitValue * couponRate * balB * nbDaysInPeriod / 360);
      couponPaymentForInvestorB = await coupon6.getPaymentAmountForInvestor(payer.call(), await investorB.account());
      
      expect(couponPaymentForInvestorB).to.equal(paymentB.toString());


      balanceB = register.balanceOfCoupon(cak.call(), await investorB.account(), couponDate);

      //console.log("balance B : " + balB);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentB : " + paymentB.toString());

      //console.log("couponPaymentForInvestorB : " + couponPaymentForInvestorB);
      //console.log("------------------------------------------");

      await coupon6.toggleCouponPayment(cak.send({maxGas:100000}), await investorB.account());

      //console.log("investorPayments B: " + await coupon3.getInvestorPayments(payer.call(), await investorB.account()));


      //console.log("------------------------------------------");




      //We calculate the payment amount for the second coupon for investorC
      balC = await register.balanceOfCoupon(cak.call(), await investorC.account(), couponDate);
      paymentC = Math.floor(unitValue * couponRate * balC * nbDaysInPeriod / 360);
      couponPaymentForInvestorC = await coupon6.getPaymentAmountForInvestor(payer.call(), await investorC.account());
      
      expect(couponPaymentForInvestorC).to.equal(paymentC.toString());


      let balanceC = register.balanceOfCoupon(cak.call(), await investorC.account(), couponDate);

      //console.log("balance C : " + balC);
      //console.log("unitValue : " + unitValue);
      //console.log("couponRate : " + couponRate);

      //console.log("paymentC : " + paymentC.toString());

      //console.log("couponPaymentForInvestorC : " + couponPaymentForInvestorC);
      //console.log("------------------------------------------");

      await coupon6.toggleCouponPayment(cak.send({maxGas:100000}), await investorC.account());
      await coupon6.toggleCouponPayment(cak.send({maxGas:100000}), await investorD.account());
      
   
      //as bnd is in the list of investors, we make the payment ready, so we can finalize the coupon
      // await coupon6.toggleCouponPayment(payer.send({maxGas:100000}), await bnd.account());

      // await coupon6.finalizeCoupon(payer.send({maxGas:100000}));
      // TODO: Close coupon, check status 3
      // expect(await coupon6.status(payer.call())).to.equal('3');


      ////console.log(await coupon.status(payer.call())).to.equal('5');

      //console.log(await register.getInvestorListAtCoupon(payer.call(),couponDate));

      //console.log("investor A : " + await investorA.account());
      //console.log("investor B : " + await investorB.account());
      //console.log("investor C : " + await investorC.account());
      //console.log("bnd : " + await bnd.account());

      //console.log("------------------------------------------");

      //expect(await coupon3.status(payer.call())).to.equal('4');

      
    });

  })

})

//TODO: add tests for coupon toggleCouponPayment; setPaymentAsToBePaid, makePaymentReceived