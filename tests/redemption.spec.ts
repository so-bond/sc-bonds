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
import { addPart, blockTimestamp, initWeb3Time, makeBondDate, makeDateTime, mineBlock, today } from "./dates";
import { closeEvents, collectEvents, getEvents } from "./events";
import { bilateralTrade } from "./shared";



const RegisterContractName = "Register";
const PrimaryIssuanceContractName = "PrimaryIssuance";
const BilateralTradeContractName = "BilateralTrade";
const CouponTradeContractName = "Coupon";
const RedemptionTradeContractName = "Redemption"; 



//const {time} = require('@openzeppelin/test-helpers');




describe("Run tests of the Redemption contract", function () {
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
  let maturityDate: number;
  let futurTimestamp: number;
  let expectedSupply: number;


  async function init(): Promise<void> {
    web3 = new Web3(Ganache.provider({ default_balance_ether: 1000, gasLimit: blockGasLimit, chain: {vmErrorsOnRPCResponse:true}, logging: {quiet:true} }) as any);
    initWeb3Time(web3)
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

    const dates = makeBondDate(1, 2 * 24 * 3600)
    firstCouponDate = dates.couponDates[0];
    maturityDate = dates.maturityDate;
    expectedSupply = 5000;
    //console.log("coupon 1 : " + firstCouponDate);


    const bondName = "EIB 3Y 1Bn SEK";
    const isin = "EIB3Y";
    const currency = web3.utils.asciiToHex("SEK");
    const unitVal = 100000;
    const couponRate = web3.utils.asciiToHex("0.4");;
    // const creationDate = 1309002208; //UTC
    // const issuanceDate = 1309102208; //UTC
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
        maturityDate,
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
    await register.enableInvestorToWhitelist(custodianA.send({maxGas:130000}), await investorC.account());
    await register.enableInvestorToWhitelist(custodianA.send({maxGas:130000}), await investorD.account());


    // await register.setExpectedSupply(cak.send({maxGas:100000}),1000);
    await register.makeReady(cak.send({maxGas: makeReadyGas}));

    //initialization of he register  post issuance
    const primary = await allContracts.get(PrimaryIssuanceContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, 100);

    await register.balanceOf(bnd.call(), await bnd.account());

    //whitelist primary issuance contract
    let hash1 = await register.atReturningHash(cak.call(), primary.deployedAt);
    await register.enableContractToWhitelist(cak.send({maxGas:120000}), hash1);

    await primary.validate(bnd.send({maxGas: 400000}));
    
    //deploy bilateral trade
    const trade = await allContracts.get(BilateralTradeContractName).deploy(bnd.newi({maxGas:1000000}), register.deployedAt, await investorA.account());
    
    let hash2 = await register.atReturningHash(cak.call(), trade.deployedAt);
    await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash2);
    
    
    
    let details = await trade.details(bnd.call());
    details.quantity = 155;
    details.tradeDate = addPart(dates.issuanceDate, "D", 1); //Date.UTC(2022, 9, 10) / (1000*3600*24);
    details.valueDate = addPart(dates.issuanceDate, "D", 2); // Date.UTC(2022, 9, 12) / (1000*3600*24);
    details.price = 101 * 10_000;
    await trade.setDetails(bnd.send({maxGas:300000}), details);
    
    await trade.approve(bnd.send({maxGas:400000}));
    
    await trade.approve(investorA.send({maxGas:100000}));
    
    await trade.executeTransfer(bnd.send({maxGas:400000}));
  }


  describe("Redemption proces", function () {
    beforeEach(async () => {
      await init();
    });
    afterEach(() => {
      closeEvents()
    });

    it('should have a valid initialization', async () => {
      expect(getEvents(register).has("RegisterStatusChanged", {status: "2"})).equal(1)
    });

    it("should fail to deploy the redemption when maturity date is not known by the register", async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;

      const p = allContracts.get(RedemptionTradeContractName).deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, firstCouponDate, 360 , addPart(firstCouponDate, "D", -1), 1500);
      await expect(p).to.be.rejectedWith("this maturity Date does not exists");
   
      });


    it("should deploy the redemption and get maturity amount for investor", async () => {
      const isPay = await register.isPay(payer.call(), await payer.account());
      expect(isPay).to.be.true;
    
      const redemption = await allContracts
        .get(RedemptionTradeContractName)
        .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, maturityDate, 360 , addPart(maturityDate, "D", -1), 1500);

        let bal = await register.balanceOfCoupon(payer.call(), await investorA.account(), maturityDate);

        let unitValue = await register.getBondUnitValue(cak.call());

        let maturityAmount = unitValue * bal;

        const actual = (await redemption.getMaturityAmountForInvestor(payer.call(), await investorA.account())) as string;
        expect(actual).to.equal(maturityAmount.toString());
        
      });



      it("should try to toggle Redemption Payment but revert as the investor is not allowed", async () => {
        const redemption = await allContracts
        .get(RedemptionTradeContractName)
        .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, maturityDate, 360 ,addPart(maturityDate, "D", -1), 1500);

        //whitelist redemption contract into register
        let hash1 = await register.atReturningHash(cak.call(), redemption.deployedAt);
        await register.enableContractToWhitelist(cak.send({maxGas:120000}), hash1);

        await redemption.setDateAsCurrentCoupon(payer.send({ maxGas: 300000 }));

        await expect(redemption.toggleRedemptionPayment(payer.send({ maxGas: 300000 }), await wrongAccount.account())).to.be.rejectedWith("This investor is not allowed");

      });

      

      it("should try to toggle Redemption Payment but revert as the maturity cut off time has not passed", async () => {
        const redemption = await allContracts
        .get(RedemptionTradeContractName)
        .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, maturityDate, 360 ,addPart(maturityDate, "D", -1), 1500);

        await collectEvents(payer, redemption)
        //whitelist redemption contract into register
        let hash1 = await register.atReturningHash(cak.call(), redemption.deployedAt);
        await register.enableContractToWhitelist(cak.send({maxGas:120000}), hash1);

        await redemption.setDateAsCurrentCoupon(payer.send({ maxGas: 300000 }));

        getEvents(redemption).print()
        const p=redemption.toggleRedemptionPayment(cak.send({ maxGas: 300000 }), await investorA.account());
        await expect(p).to.be.rejectedWith("the maturity cut of time has not passed");


        //await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);

      });


      it("should try to toggle Redemption Payment after coupon process", async () => {
    
          const isPay = await register.isPay(payer.call(), await payer.account());
          expect(isPay).to.be.true;
    
          let couponDate = firstCouponDate;
          //console.log("coupon 1 : " + couponDate);
    
          let nbDaysInPeriod = 180;
          let cutOffTimeInSec = 16 * 3600;
    
          //Given a first coupon is deployed
          const coupon = await allContracts.get(CouponTradeContractName).deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, addPart(couponDate, "D", -1), cutOffTimeInSec);
          
          let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
          await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);
    
          await coupon.setDateAsCurrentCoupon(payer.send({maxGas: 300000}));  //implicit coupon validation

          await mineBlock(couponDate + cutOffTimeInSec + 1000); // pass the cut of time
          
          // triggers the previous snapshot and sets investorB balance to 100
          // in init, investorA balance was set to 155
          await register.transferFrom(cak.send({maxGas:400000}), await bnd.account(), await investorB.account(), 100)
          expect(getEvents(register).has("Snapshot", {id:"1"})).equal(1)

          const redemption = await allContracts
          .get(RedemptionTradeContractName)
          .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, maturityDate, nbDaysInPeriod ,addPart(maturityDate, "D", -1), cutOffTimeInSec);

          let redemptionPaymentStatus = await redemption.getInvestorRedemptionPayments(payer.call(), await investorA.account());
        
          //console.log(redemptionPaymentStatus);


          //whitelist redemption contract into register
          let hash1 = await register.atReturningHash(cak.call(), redemption.deployedAt);
          await register.enableContractToWhitelist(cak.send({maxGas:120000}), hash1);


          await redemption.setDateAsCurrentCoupon(payer.send({ maxGas: 300000 }));
          await register.transferFrom(cak.send({maxGas:400000}), await bnd.account(), await investorC.account(), 100)

          await mineBlock(addPart(maturityDate, "D", -1) + cutOffTimeInSec + 1000);

          
          await redemption.toggleRedemptionPayment(cak.send({maxGas:500000}), await investorA.account())
          await redemption.toggleRedemptionPayment(cak.send({maxGas:500000}), await investorB.account())
          
          const p = register.transferFrom(cak.send({maxGas:400000}), await bnd.account(), await investorD.account(), 666);
          await expect(p).to.be.rejectedWith(/the maturity is reached/)
          
          getEvents(register).print()

          // try placing a new maturity contract
          const redemption2 = await allContracts
          .get(RedemptionTradeContractName)
          .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, maturityDate, nbDaysInPeriod ,addPart(maturityDate, "D", -1), cutOffTimeInSec);

          await expect(redemption2.setDateAsCurrentCoupon(payer.send({ maxGas: 300000 }))).to.be.rejectedWith("Date of coupon or maturity already taken");
      });


      it("should try to close the register and burn the total balance", async () => {
    
          let couponDate = firstCouponDate;
          let recordDate = addPart(couponDate, "D", -1);
          //console.log("coupon 1 : " + couponDate);
    
          let nbDaysInPeriod = 180;
          let cutOffTimeInSec = 16 * 3600;
    
          // Nedd all balances to be in an investor, not in the BnD
          const bndBalance = await register.balanceOf(cak.call(), await bnd.account());
          // await register.transferFrom(cak.send({maxGas: 500000}), await bnd.account(), await investorD.account(), bndBalance);
          await bilateralTrade(register, bnd, investorD, bndBalance, today());

          //Given a first coupon is deployed
          const coupon = await allContracts.get(CouponTradeContractName)
            .deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);
          
          let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
          await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);
    
          await coupon.setDateAsCurrentCoupon(payer.send({maxGas: 300000}));  //implicit coupon validation

          await mineBlock(recordDate + cutOffTimeInSec + 1000); // pass the cut of time
  
          recordDate = addPart(maturityDate, "D", -1);
          const redemption = await allContracts
            .get(RedemptionTradeContractName)
            .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, maturityDate, nbDaysInPeriod , recordDate, cutOffTimeInSec);

          //whitelist redemption contract into register
          let hash1 = await register.atReturningHash(cak.call(), redemption.deployedAt);
          await register.enableContractToWhitelist(cak.send({maxGas:120000}), hash1);


          await redemption.setDateAsCurrentCoupon(payer.send({ maxGas: 300000 }));

          // make a transfer between investors
          await bilateralTrade(register, investorD, investorB, 20, today());

          await mineBlock(recordDate + cutOffTimeInSec + 1000);

          const investorsAtMaturity: string[] = await register.getInvestorListAtCoupon(payer.call(), maturityDate);
          // console.log("List of investors at coupon",couponDate, investorsAtCoupon);
          expect(investorsAtMaturity).not.include(await bnd.account())
          const balancesAtMaturity = (await Promise.all(
            investorsAtMaturity.map(inv=> register.balanceOfCoupon(payer.call(), inv, maturityDate))
          )).map( (bal, i)=>({address:investorsAtMaturity[i], bal: Number.parseInt(bal)}))
          console.log("Balances at coupon", balancesAtMaturity);
          const totalBalance = balancesAtMaturity.reduce( (prev, current)=>prev+current.bal, 0)
          expect(totalBalance).eq(expectedSupply);
          
          await redemption.toggleRedemptionPayment(cak.send({maxGas:500000}), await investorA.account())
          await redemption.toggleRedemptionPayment(cak.send({maxGas:500000}), await investorB.account())
          await redemption.toggleRedemptionPayment(cak.send({maxGas:500000}), await investorD.account())
          
          const totalSupply = await register.totalSupply(cak.call());
          const primaryIssuanceBalance = await register.balanceOf(cak.call(), register.deployedAt);

          expect(primaryIssuanceBalance).to.equal(totalSupply);
          
          await register.burn(cak.send({maxGas: 400000}), totalSupply);

          await expect(register.mint(cak.send({maxGas: 400000}), 1000)).to.be.rejectedWith(/the Register is closed/i)

          getEvents(register).print()

      });

      it("should not manage to perform a trade after the redemption cut off time", async () => {
    
          let couponDate = firstCouponDate;
          let recordDate = addPart(couponDate, "D", -1);
          //console.log("coupon 1 : " + couponDate);
    
          let nbDaysInPeriod = 180;
          let cutOffTimeInSec = 16 * 3600;
    
          // Nedd all balances to be in an investor, not in the BnD
          const bndBalance = await register.balanceOf(cak.call(), await bnd.account());
          // await register.transferFrom(cak.send({maxGas: 500000}), await bnd.account(), await investorD.account(), bndBalance);
          await bilateralTrade(register, bnd, investorD, bndBalance, today());

          //Given a first coupon is deployed
          const coupon = await allContracts.get(CouponTradeContractName)
            .deploy(payer.newi({maxGas:2000000}), register.deployedAt, couponDate, nbDaysInPeriod, recordDate, cutOffTimeInSec);
          
          let hash = await register.atReturningHash(cak.call(), coupon.deployedAt);
          await register.enableContractToWhitelist(cak.send({maxGas:100000}), hash);
    
          await coupon.setDateAsCurrentCoupon(payer.send({maxGas: 300000}));  //implicit coupon validation

          await mineBlock(recordDate + cutOffTimeInSec + 1000); // pass the cut of time
  
          recordDate = addPart(maturityDate, "D", -1);
          const redemption = await allContracts
            .get(RedemptionTradeContractName)
            .deploy(payer.newi({ maxGas: 2000000 }), register.deployedAt, maturityDate, nbDaysInPeriod , recordDate, cutOffTimeInSec);

          //whitelist redemption contract into register
          let hash1 = await register.atReturningHash(cak.call(), redemption.deployedAt);
          await register.enableContractToWhitelist(cak.send({maxGas:120000}), hash1);


          await redemption.setDateAsCurrentCoupon(payer.send({ maxGas: 300000 }));

          // make a transfer between investors
          await bilateralTrade(register, investorD, investorB, 20, today());

          await mineBlock(maturityDate + cutOffTimeInSec + 1000);

          // try making a trade after the redemption cut off time
          const p = bilateralTrade(register, investorD, investorB, 5, today());
          await expect(p).to.be.rejectedWith(/the maturity cut-off time has passed/)

          // display register events
          getEvents(register).print()
      });


  })

})