import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import Web3 from "web3";
import Ganache from "ganache";
import { Web3FunctionProvider } from "@saturn-chain/web3-functions";
import { EthProviderInterface } from "@saturn-chain/dlt-tx-data-functions";

import allContracts from "../contracts";
import { SmartContract, SmartContractInstance } from "@saturn-chain/smart-contract";
import { blockGasLimit, registerGas } from "./gas.constant";
import { addPart, blockTimestamp, initWeb3Time, makeBondDate, mineBlock } from "./dates";
import { collectEvents, getEvents } from "./events";

const RegisterContractName = "Register";
const CouponTradeContractName = "Coupon";

describe("Register (Bond Issuance) metadata", function () {
  this.timeout(10000);
  let web3: Web3;
  let cak: EthProviderInterface;
  let stranger: EthProviderInterface;
  let instance: SmartContractInstance;
  let Register: SmartContract;
  let cakAddress: string;
  let strangerAddress: string;
  let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);

  async function deployRegisterContract(): Promise<void> {
    web3 = new Web3(Ganache.provider({ default_balance_ether: 1000, gasLimit: blockGasLimit, chain: {vmErrorsOnRPCResponse:true} }) as any);
    initWeb3Time(web3);
    cak = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[0]));
    stranger = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[1]));
    cakAddress = await cak.account(0);
    strangerAddress = await cak.account(1);
    
    const bondName = "EIB 3Y 1Bn SEK";
    const isin = "EIB3Y";
    const expectedSupply = 1000;
    const currency = web3.utils.asciiToHex("SEK");
    const unitVal = 100000;
    const couponRate = 0.4 * 100 * 10000
    const creationDate = initialBondDates.creationDate
    const issuanceDate = initialBondDates.issuanceDate
    const maturityDate = initialBondDates.maturityDate
    const couponDates = initialBondDates.couponDates
    const defaultCutofftime = initialBondDates.defaultCutofftime

    if (allContracts.get(RegisterContractName)) {
      Register = allContracts.get(RegisterContractName);
      instance = await Register.deploy(
        cak.newi({ maxGas: registerGas+100000 }),
        bondName,
        isin,
        expectedSupply,
        currency,
        unitVal,
        couponRate,
        creationDate,
        issuanceDate,
        maturityDate,
        couponDates,
        defaultCutofftime
      );
      await collectEvents(cak, instance);
    } else {
      throw new Error(RegisterContractName + " contract not defined in the compilation result");
    }
  }
  beforeEach(async () => {
    await deployRegisterContract();
  });



  it("setBondData without the coupons", async () => {
    const bondName = "EIB 3Y 1Bn SEK";
    const symbol = "SEK";
    const expectedSupply = 1000;
    const currency = web3.utils.asciiToHex("SEK", 32);;
    const unitVal = 100000;
    const couponRate = 0.5 * 100 * 10000;
    const issuanceDate = initialBondDates.issuanceDate - 1;
    const maturityDate = initialBondDates.maturityDate + 24 * 3600;
    // const couponDates = [1309302208, 1309402208]; //UTC
    const cutOffTime = initialBondDates.defaultCutofftime + 3600;

    //ACT
    await instance.setBondData(cak.send({ maxGas: 130000 }), bondName, expectedSupply, currency, unitVal, couponRate, issuanceDate, maturityDate, cutOffTime);

    //ASSERT
    const bondData = await instance.getBondData(cak.call());


    // console.log("BOND DATA : ", bondData);
    // console.log("BOND DATA SET : " + bonDataSet);
    
    expect(bondData.name).equal(bondName);
    expect(bondData.currency).equal(currency+"0000000000000000000000000000000000000000000000000000000000");
    expect(bondData.expectedSupply).equal(`${expectedSupply}`);
    expect(bondData.unitValue).equal(`${unitVal}`);
    expect(bondData.couponRate).equal(`${couponRate}`);
    expect(bondData.issuanceDate).equal(`${issuanceDate}`);
    expect(bondData.maturityDate).equal(`${maturityDate}`);
    expect(bondData.cutOffTime).equal(`${cutOffTime}`);

  });

  describe('Test the setting of the coupons before time started', () => {
    it('should add a coupon in the middle', async () => {
      // ACT
      const newDate = initialBondDates.couponDates[0] + 5 * 24 * 3600; // + 5 days
      const gas = await instance.addCouponDate(cak.test(), newDate);
      await instance.addCouponDate(cak.send({maxGas: gas}), newDate);
      //ASSERT
      let expectedCoupons: any[] = [...initialBondDates.couponDates];
      expectedCoupons.push(newDate);
      expectedCoupons = expectedCoupons.sort().map(c=>`${c}`);
      const bondData = await instance.getBondData(cak.call());
      // console.log("BOND DATA : ", bondData, gas);

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal([...bondData.couponDates].sort());
      expect(bondData.couponDates.length).equal(initialBondDates.couponDates.length+1);
      expect(bondData.couponDates[1]).equal(`${newDate}`)
      expect(bondData.couponDates).deep.equal(expectedCoupons);

    });

    it('should add a coupon date in the first place', async () => {
      // ACT
      const newDate = initialBondDates.couponDates[0] - 5 * 24 * 3600; // - 5 days
      const gas = await instance.addCouponDate(cak.test(), newDate);
      await instance.addCouponDate(cak.send({maxGas: gas}), newDate);
      //ASSERT
      const bondData = await instance.getBondData(cak.call());
      // console.log("BOND DATA : ", bondData, gas);

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal([...bondData.couponDates].sort());
      expect(bondData.couponDates.length).equal(initialBondDates.couponDates.length+1);
      expect(bondData.couponDates[0]).equal(`${newDate}`)
    });

    it('should add a coupon date in the last place', async () => {
      // ACT
      const newDate = initialBondDates.couponDates[initialBondDates.couponDates.length-1] + 5 * 24 * 3600; // - 5 days
      console.log("Adding a date", {newDate});
      const gas = await instance.addCouponDate(cak.test(), newDate);
      
      await instance.addCouponDate(cak.send({maxGas: gas}), newDate);
      //ASSERT
      const bondData = await instance.getBondData(cak.call());
      // console.log("BOND DATA : ", bondData, gas);

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal([...bondData.couponDates].sort());
      expect(bondData.couponDates.length).equal(initialBondDates.couponDates.length+1);
      expect(bondData.couponDates[bondData.couponDates.length-1]).equal(`${newDate}`)
    });

    it('should fail adding a coupon date after or on the maturity', async () => {
      // ACT
      const newDate = initialBondDates.maturityDate; // 
      const p = instance.addCouponDate(cak.send({maxGas: 100000}), newDate);
      //ASSERT
      await expect(p).to.be.rejectedWith(/Cannot set a coupon date greater or equal to the maturity date/)
    });

    it('should fail adding a coupon date before or on the issuance date', async () => {
      // ACT
      const newDate = initialBondDates.issuanceDate; // 
      const p = instance.addCouponDate(cak.send({maxGas: 100000}), newDate);
      //ASSERT
      await expect(p).to.be.rejectedWith(/Cannot set a coupon date smaller or equal to the issuance date/)
    });

    it('should remove a coupon date in the last place', async () => {
      // ACT
      const toRemove = initialBondDates.couponDates[initialBondDates.couponDates.length-1]; 
      const gas = await instance.delCouponDate(cak.test(), toRemove);
      await instance.delCouponDate(cak.send({maxGas: gas}), toRemove);
      //ASSERT
      const expectedCoupons = initialBondDates.couponDates.map(c=>`${c}`);
      expectedCoupons.pop();
      const bondData = await instance.getBondData(cak.call());
      // console.log("BOND DATA : ", bondData, gas);

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal([...bondData.couponDates].sort());
      expect(bondData.couponDates.length).equal(initialBondDates.couponDates.length-1);
      expect(bondData.couponDates).deep.equal(expectedCoupons);
    });

    it('should remove a coupon date in the first place', async () => {
      // ACT
      const toRemove = initialBondDates.couponDates[0]; 
      const gas = await instance.delCouponDate(cak.test(), toRemove);
      await instance.delCouponDate(cak.send({maxGas: gas}), toRemove);
      //ASSERT
      const expectedCoupons = initialBondDates.couponDates.map(c=>`${c}`);
      expectedCoupons.shift();
      const bondData = await instance.getBondData(cak.call());
      // console.log("BOND DATA : ", bondData, gas);

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal([...bondData.couponDates].sort());
      expect(bondData.couponDates.length).equal(initialBondDates.couponDates.length-1);
      expect(bondData.couponDates).deep.equal(expectedCoupons);
    });

    it('should remove a coupon date in the middle', async () => {
      // ACT
      const toRemove = initialBondDates.couponDates[1]; 
      const gas = await instance.delCouponDate(cak.test(), toRemove);
      await instance.delCouponDate(cak.send({maxGas: gas}), toRemove);
      //ASSERT
      let expectedCoupons = initialBondDates.couponDates.map(c=>`${c}`);
      expectedCoupons = expectedCoupons.filter( (c,i)=>i!==1);
      const bondData = await instance.getBondData(cak.call());
      // console.log("BOND DATA : ", bondData, gas);

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal([...bondData.couponDates].sort());
      expect(bondData.couponDates.length).equal(initialBondDates.couponDates.length-1);
      expect(bondData.couponDates).deep.equal(expectedCoupons);
    });


  });


  describe('Test the setting of the coupons when the time passes', () => {
    let pay: EthProviderInterface;
    beforeEach(async () => {
      pay = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[2]));
      await instance.grantPayRole(cak.send({maxGas: 100_000}), await pay.account());

    });
    async function passCoupon(datetime: number) {
      let hash = "";
      for (const couponDate of initialBondDates.couponDates) {
        const recordDate = addPart(couponDate, "D", -1);
        if (couponDate <= datetime) {
          await mineBlock(recordDate-1); // go to the date of the coupon but just before 
          let coupon = await allContracts
            .get(CouponTradeContractName)
            .deploy(pay.newi({ maxGas: 2_000_000 }), instance.deployedAt, couponDate, 360, recordDate, initialBondDates.defaultCutofftime);
          if (hash == "") {
            hash = await instance.atReturningHash(cak.call(), coupon.deployedAt);
            await instance.enableContractToWhitelist(cak.send({ maxGas: 200_000 }), hash);
          }
          await coupon.setDateAsCurrentCoupon(pay.send({maxGas: 200_000}));
          const timestamp = await instance.currentSnapshotDatetime(pay.call());
          // console.log("passing coupon", {datetime, couponDate, timestamp, block: await web3.eth.getBlockNumber(), time: await blockTimestamp()});
        }
      }
      await mineBlock(datetime);
    }

    it('should update the next timestamp if adding a coupon before the next one but after the current one', async () => {
      // Given the first coupon has been created but time is before the timestamp
      // const dataB4 = await instance.getBondData(cak.call());
      
      await passCoupon(initialBondDates.couponDates[0] - 1000);
      const newDate = initialBondDates.couponDates[0]+5*24*3600; // 5 days
      // When a coupon is added just after the current one
      await instance.addCouponDate(cak.send({maxGas: 300_000}), newDate);
      // Then the current coupon date should not change, the current timestamp either and the next one should
      // const data = await instance.getBondData(cak.call());
      const currentCouponDate = await instance.currentCouponDate(pay.call());
      const currentSnapshotDatetime = await instance.currentSnapshotDatetime(pay.call());
      const nextSnapshotDatetime = await instance.nextSnapshotDatetime(pay.call());
      // getEvents(instance).print();
      // console.log("Bond data before", dataB4);
      // console.log("Bond data after", data);
      
      expect(currentCouponDate).to.equal(`${initialBondDates.couponDates[0]}`)
      expect(currentSnapshotDatetime).to.equal(`${initialBondDates.couponDates[0] + initialBondDates.defaultCutofftime}`)
      expect(nextSnapshotDatetime).to.equal(`${newDate + currentSnapshotDatetime % (24*3600)}`)
      expect(getEvents(instance).has("SnapshotTimestampChange", {nextTimestamp: nextSnapshotDatetime})).equal(1)
    });

    it('should update the current timestamp if adding a coupon before the current', async () => {
      // Given the first coupon has been created but time is before the timestamp
      // const dataB4 = await instance.getBondData(cak.call());
      
      await passCoupon(initialBondDates.couponDates[1] - 10*24*3600);
      const newDate = initialBondDates.couponDates[1] - 5*24*3600;
      const nextSnapshotDatetimeB4 = await instance.nextSnapshotDatetime(pay.call());
      // When a coupon is added just after the current one
      await instance.addCouponDate(cak.send({maxGas: 300_000}), newDate);
      // Then the current coupon date should not change, the current timestamp either and the next one should
      // const data = await instance.getBondData(cak.call());
      const currentCouponDate = await instance.currentCouponDate(pay.call());
      const currentSnapshotDatetime = await instance.currentSnapshotDatetime(pay.call());
      const nextSnapshotDatetime = await instance.nextSnapshotDatetime(pay.call());
      // getEvents(instance).print();
      // console.log("Bond data before", dataB4);
      // console.log("Bond data after", data, {currentCouponDate, currentSnapshotDatetime, nextSnapshotDatetime, newDate});
      
      expect(currentCouponDate).to.equal(`${newDate}`)
      expect(currentSnapshotDatetime).to.equal(`${newDate + initialBondDates.defaultCutofftime}`)
      expect(nextSnapshotDatetime).to.equal(nextSnapshotDatetimeB4)
      expect(getEvents(instance).has("SnapshotTimestampChange", {couponDate: currentCouponDate})).equal(1)
    });

    it('should update the next timestamp if deleting the coupon following the current one', async () => {
      // Given the first coupon has been created but time is before the timestamp
      // const dataB4 = await instance.getBondData(cak.call());
      
      await passCoupon(initialBondDates.couponDates[0] - 1);
      const toDelete = initialBondDates.couponDates[1];
      const next = initialBondDates.couponDates[2];
      // When a coupon is added just after the current one
      await instance.delCouponDate(cak.send({maxGas: 300_000}), toDelete);
      // Then the current coupon date should not change, the current timestamp either and the next one should
      // const data = await instance.getBondData(cak.call());
      const currentCouponDate = await instance.currentCouponDate(pay.call());
      const currentSnapshotDatetime = await instance.currentSnapshotDatetime(pay.call());
      const nextSnapshotDatetime = await instance.nextSnapshotDatetime(pay.call());
      // getEvents(instance).print();
      // console.log("Bond data before", dataB4);
      // console.log("Bond data after", data);
      
      expect(currentCouponDate).to.equal(`${initialBondDates.couponDates[0]}`)
      expect(currentSnapshotDatetime).to.equal(`${initialBondDates.couponDates[0] + initialBondDates.defaultCutofftime}`)
      expect(nextSnapshotDatetime).to.equal(`${next + currentSnapshotDatetime % (24*3600)}`)
      expect(getEvents(instance).has("SnapshotTimestampChange", {nextTimestamp: nextSnapshotDatetime})).equal(1)
    });

    it('should update the current timestamp to the maturity when deleting all coupons', async () => {
      // Given the first coupon has been created but time is before the timestamp
      // const dataB4 = await instance.getBondData(cak.call());
      
      await passCoupon(initialBondDates.couponDates[0] - 5 * 24 * 3600);
      
      // When al coupons are deleted 
      for (const coupon of initialBondDates.couponDates) {
        await instance.delCouponDate(cak.send({maxGas: 300_000}), coupon);
      }

      // Then the current coupon date should be the maturity date and the next should be zero
      // const data = await instance.getBondData(cak.call());
      const currentCouponDate = await instance.currentCouponDate(pay.call());
      const currentSnapshotDatetime = await instance.currentSnapshotDatetime(pay.call());
      const nextSnapshotDatetime = await instance.nextSnapshotDatetime(pay.call());
      // getEvents(instance).print();
      // console.log("Bond data before", dataB4);
      // console.log("Bond data after", data);
      
      expect(currentCouponDate).to.equal(`${initialBondDates.maturityDate}`)
      expect(currentSnapshotDatetime).to.equal(`${initialBondDates.maturityDate + initialBondDates.defaultCutofftime}`)
      expect(nextSnapshotDatetime).to.equal(`0`)
      expect(getEvents(instance).has("SnapshotTimestampChange", {nextTimestamp: nextSnapshotDatetime})).equal(1)
    });

    it('should fail deleting a passed coupon ', async () => {
      // Given the first coupon has been created but time is before the timestamp
      // const dataB4 = await instance.getBondData(cak.call());
      
      await passCoupon(initialBondDates.couponDates[0] + 1);
      const toDelete = initialBondDates.couponDates[0];
      // When a coupon is deleted 
      const p = instance.delCouponDate(cak.send({maxGas: 300_000}), toDelete);
      
      // Then the promise should fails
      await expect(p).to.be.rejectedWith("This coupon date cannot be deleted");
    });

    it('should fail adding a coupon before the current one', async () => {
      // Given the first coupon has been created but time is before the timestamp
      // const dataB4 = await instance.getBondData(cak.call());
      
      await passCoupon(initialBondDates.couponDates[0] + 1);
      const toAdd = initialBondDates.couponDates[0] - 5 * 24 * 3600;
      // When a coupon is added just before the current one
      const p = instance.addCouponDate(cak.send({maxGas: 300_000}), toAdd);
      
      // Then the promise should fails
      await expect(p).to.be.rejectedWith("Cannot insert this date, it is in the past");
    });



  });

  it("setBondData should be denied if called is not CAK", async () => {
    const bondName = "EIB 3Y 1Bn SEK";
    const isin = web3.utils.asciiToHex("Code Isin");
    const expectedSupply = 1000;
    const currency = web3.utils.asciiToHex("SEK");;
    const unitVal = 100000;
    const couponRate = web3.utils.asciiToHex("0.4");;
    const issuanceDate = 1309102208; //UTC
    const maturityDate = 1309202208; //UTC
    // const couponDates = [1309302208, 1309402208]; //UTC
    const defaultCutofftime = 17 * 3600; //17:00

    //ACT
    await expect(
      instance.setBondData(stranger.send({ maxGas: 130000 }), bondName, expectedSupply, currency, unitVal, couponRate, issuanceDate, maturityDate, defaultCutofftime)
    ).to.be.rejectedWith("Caller must be CAK");
  });
});
