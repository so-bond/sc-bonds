import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import Web3 from "web3";
import Ganache from "ganache";
import { Web3FunctionProvider } from "@saturn-chain/web3-functions";
import { EthProviderInterface } from "@saturn-chain/dlt-tx-data-functions";
import { EventData } from "web3-eth-contract";
import allContracts from "../contracts";
import { EventReceiver, SmartContract, SmartContractInstance } from "@saturn-chain/smart-contract";
import { blockGasLimit, makeReadyGas, mintGas, registerGas } from "./gas.constant";
import { makeBondDate } from "./dates";

const RegisterContractName = "Register";

describe("Register (Bond Issuance) contract events", function () {
  this.timeout(10000);
  let web3: Web3;
  let cak: EthProviderInterface;
  let stranger: EthProviderInterface;
  let instance: SmartContractInstance;
  let Register: SmartContract;
  let cakAddress: string;
  let strangerAddress: string;
  let contractAddress: string;
  let custodianA: EthProviderInterface;

  async function deployRegisterContract(): Promise<void> {
    web3 = new Web3(Ganache.provider({ default_balance_ether: 1000, gasLimit: blockGasLimit, chain: {vmErrorsOnRPCResponse:true} }) as any);
    cak = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[0]));
    stranger = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[1]));
    cakAddress = await cak.account(0);
    strangerAddress = await cak.account(1);
    custodianA = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[2]));

    const dates = makeBondDate(2)
    const bondName = "EIB 3Y 1Bn SEK";
    const isin = "EIB3Y";
    const expectedSupply = 1000;
    const currency = web3.utils.asciiToHex("SEK");
    const unitVal = 100000;
    const couponRate = web3.utils.asciiToHex("0.4");
    // const creationDate = 1309002208; //UTC
    // const issuanceDate = 1309102208; //UTC
    // const maturityDate = 1309202208; //UTC
    // const couponDates = [1309302208, 1309402208]; //UTC
    // const defaultCutofftime = 17 * 3600; //17:00

    if (allContracts.get(RegisterContractName)) {
      Register = allContracts.get(RegisterContractName);
      instance = await Register.deploy(
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
      contractAddress = instance.deployedAt;
    } else {
      throw new Error(RegisterContractName + " contract not defined in the compilation result");
    }
  }

  let eventSubscription: EventReceiver;
  let eventNames: string[] = [];
  this.beforeEach(async () => {
    await deployRegisterContract();
    // collect all events
    eventSubscription = instance.allEvents(cak.sub(), { fromBlock: 1 }).on("log", (log) => {
      eventNames.push(log.event);
      // console.log(">>>", log.blockNumber, log.event, log.returnValues); //enable this to see all events during the tests
    });
  });

  this.afterEach(() => {
    eventNames = [];
    // console.log("On afterEach cleaning up event subscription..");
    if (eventSubscription) eventSubscription.removeAllListeners();
  });

  it("NewBondDrafted event should be emitted after contract is deployed", async () => {
    const log = await new Promise<EventData>(async (resolve) => {
      instance.events.NewBondDrafted(cak.get({ fromBlock: 1 }), { creator: cakAddress }).on("log", resolve);
    });
    expect(log).not.to.be.null;
    expect(log.returnValues).not.to.be.null;
    expect(log.returnValues.creator).to.equal(cakAddress);
    // expect(log.returnValues.name).to.equal(web3.utils.sha3("James"), "indexed event arg hashed using keccak256(.) ");

    expect(log.returnValues.name).to.equal("EIB 3Y 1Bn SEK", "non indexed event arg are in clear text for frontend parsing");
    expect(log.returnValues.isin).to.equal("EIB3Y", "non indexed event arg are in clear text for frontend parsing");
  });

  it("RegisterStatusChanged event should be emitted after contract is deployed", async () => {
    const log = await new Promise<EventData>(async (resolve) => {
      instance.events.RegisterStatusChanged(cak.get({ fromBlock: 1 }), {}).on("log", resolve);
    });
    expect(log).not.to.be.null;
    expect(log.returnValues).not.to.be.null;
    expect(log.returnValues.emiter).to.equal(cakAddress);
    // expect(log.returnValues.name).to.equal(web3.utils.sha3("James"), "indexed event arg hashed using keccak256(.) ");

    expect(log.returnValues.name).to.equal("EIB 3Y 1Bn SEK", "non indexed event arg are in clear text for frontend parsing");
    expect(log.returnValues.isin).to.equal("EIB3Y", "non indexed event arg are in clear text for frontend parsing");
    expect(log.returnValues.status).to.equal("0", "Bond status should be Draft after deploy");
  });

  it("RegisterStatusChanged event should be emitted after makeReady() was called", async () => {
    let actual = await instance.status(cak.call());
    expect(actual).to.equal("0", "Draft status expected, review test case before checking events");

    //ACT
    await instance.makeReady(cak.send({ maxGas: makeReadyGas }));

    //ASSERT
    actual = await instance.status(cak.call());
    expect(actual).to.equal("1", "Ready status expected, review test case before checking events");
    const nextLog = await new Promise<EventData>(async (resolve) => {
      // Caution: this promise only returns the first event at block (adjust fromBlock accordingly)
      instance.events.RegisterStatusChanged(cak.get({ fromBlock: 2 }), {}).on("log", resolve);
    });
    // console.log("RegisterStatusChanged event after make ready TOFIX::", nextLog);
    expect(nextLog).not.to.be.null;
    expect(nextLog.returnValues).not.to.be.null;
    expect(nextLog.returnValues.emiter).to.equal(cakAddress);
    expect(nextLog.returnValues.name).to.equal("EIB 3Y 1Bn SEK", "non indexed event arg are in clear text for frontend parsing");
    expect(nextLog.returnValues.isin).to.equal("EIB3Y", "non indexed event arg are in clear text for frontend parsing");
    expect(nextLog.returnValues.status).to.equal("1", "Bond status should be Ready after makeReady()");
  });

  it("CAK may transfer to stranger (out of process) and this does not emit RegisterStatusChanged event", async () => {
    const primaryIssuanceAccount = contractAddress;
    // let lastBlock = await web3.eth.getBlockNumber();

    await instance.grantCstRole(cak.send({ maxGas: 100000 }), await custodianA.account());
    await instance.enableInvestorToWhitelist(custodianA.send({ maxGas: 120000 }), strangerAddress); // needed to deploy a test trade contract

    await instance.mint(cak.send({ maxGas: mintGas }), 11); // have the primaryIssuanceAccount with non zero balance

    const balPrim = await instance.balanceOf(cak.call(), primaryIssuanceAccount);
    expect(parseInt(balPrim)).to.be.greaterThan(
      0,
      "test precondition failed: primaryIssuanceAccount should have a non zero balance before transfer"
    );

    //ACT
    await instance.transferFrom(cak.send({ maxGas: 130000 }), primaryIssuanceAccount, strangerAddress, 1);

    // console.log("eventNames", eventNames); //debugging
    expect(eventNames).not.to.include.members(
      ["RegisterStatusChanged"],
      "transferFrom should not trigger RegisterStatusChanged event if sender is CAK"
    );
    expect(eventNames).to.include.members(["Transfer"], "transferFrom should emit Transfer event");
  });

  //NOTE: Status.Issued event is unit tested in register-erc20.spec.ts
});
