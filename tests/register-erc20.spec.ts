import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import Web3 from "web3";
import Ganache from "ganache";
import { Web3FunctionProvider } from "@saturn-chain/web3-functions";
import { EthProviderInterface } from "@saturn-chain/dlt-tx-data-functions";

import allContracts from "../contracts";
import { SmartContract, SmartContractInstance } from "@saturn-chain/smart-contract";
import { blockGasLimit, mintGas, registerGas } from "./gas.constant";
import { makeBondDate } from "./dates";

const RegisterContractName = "Register";

describe("Register (Bond Issuance) contract interoperability", function () {
  this.timeout(10000);
  let web3: Web3;
  let cak: EthProviderInterface;
  let stranger: EthProviderInterface;
  let instance: SmartContractInstance;
  let Register: SmartContract;
  let cakAddress: string;
  let strangerAddress: string;

  async function deployRegisterContract(): Promise<void> {
    web3 = new Web3(Ganache.provider({ default_balance_ether: 1000, gasLimit: blockGasLimit, chain: {vmErrorsOnRPCResponse:true} }) as any);
    cak = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[0]));
    stranger = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[1]));
    cakAddress = await cak.account(0);
    strangerAddress = await cak.account(1);
    const dates = makeBondDate(2, 12*30*24*3600)
    const bondName = "EIB 3Y 1Bn SEK";
    const isin = "EIB3Y";
    const expectedSupply = 1000;
    const currency = web3.utils.asciiToHex("SEK");
    const unitVal = 100000;
    const couponRate = web3.utils.asciiToHex("0.4");;
    const creationDate = dates.creationDate
    const issuanceDate = dates.issuanceDate
    const maturityDate = dates.maturityDate
    const couponDates = dates.couponDates
    const defaultCutofftime = dates.defaultCutofftime

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
        creationDate,
        issuanceDate,
        maturityDate,
        couponDates,
        defaultCutofftime
      );
    } else {
      throw new Error(RegisterContractName + " contract not defined in the compilation result");
    }
  }

  describe("with erc-20", function () {
    before(async () => {
      await deployRegisterContract();
    });

    it("contract name be set", async () => {
      const actual = await instance.name(cak.call());
      expect(actual).to.be.equal("EIB 3Y 1Bn SEK");
    });

    it("contract symbol be set", async () => {
      const actual = await instance.symbol(cak.call());
      expect(actual).to.be.equal("EIB3Y");
    });

    it("contract decimal should be zero to avoid fractional BOND shares", async () => {
      const actual = await instance.decimals(cak.call());
      expect(actual).to.equal("0");
    });

    it("total supply is zero after deploy", async () => {
      const actual = await instance.totalSupply(cak.call());
      expect(actual).to.equal("0");
    });

    it("contract balance is zero after deploy", async () => {
      const actual = await instance.balanceOf(cak.call(), cakAddress);
      expect(actual).to.equal("0");

      const contractBalance = await instance.balanceOf(cak.call(), instance.deployedAt);
      expect(contractBalance).to.equal("0");
    });

    it("allowance before mint is zero", async () => {
      const actual = await instance.allowance(cak.call(), instance.deployedAt, cakAddress);
      expect(actual).to.equal("0");

      const contractBalance = await instance.balanceOf(cak.call(), instance.deployedAt);
      expect(contractBalance).to.equal("0");
    });

    it("balanceOf primaryIssuanceAccount should be set after mint", async function () {
      await instance.mint(cak.send({ maxGas: mintGas }), 60);
      const actual = await instance.balanceOf(cak.call(), cakAddress);
      expect(actual).to.equal("0", "CAK should NOT recieve the bond parts after mint");

      const primaryIssuanceAccount = instance.deployedAt;

      const contractBalance = await instance.balanceOf(cak.call(), primaryIssuanceAccount);
      expect(contractBalance).to.equal("60", "");
    });

    it("approve() should be denied", async () => {
      await expect(instance.approve(cak.send({ maxGas: 130000 }), strangerAddress, 30)).to.be.rejectedWith("approve is disabled");

      // const allowance = await instance.allowance(cak.call(), cakAddress, strangerAddress);
      // expect(allowance).to.equal("30");
    });

    it("allowance should stay zero after approve was denied", async () => {
      const actual = await instance.allowance(cak.call(), cakAddress, strangerAddress);
      expect(actual).to.equal("0");
    });

    it("increaseAllowance() should be denied", async () => {
      await expect(instance.increaseAllowance(cak.send({ maxGas: 130000 }), strangerAddress, 30)).to.be.rejectedWith(
        "increaseAllowance is disabled"
      );
    });

    it("decreaseAllowance() should be denied", async () => {
      await expect(instance.decreaseAllowance(cak.send({ maxGas: 130000 }), strangerAddress, 30)).to.be.rejectedWith(
        "decreaseAllowance is disabled"
      );
    });

    it("transfer() should be denied", async () => {
      await expect(instance.transfer(cak.send({ maxGas: 130000 }), strangerAddress, 1)).to.be.rejectedWith("transfer is disabled");
    });

    

    it("transferFrom() should be denied when contract is not whitelisted", async () => {
      
      const primaryIssuanceAccount = instance.deployedAt;

      // console.log(primaryIssuanceAccount);
      await expect(instance.transferFrom(stranger.send({ maxGas: 130000 }), primaryIssuanceAccount, strangerAddress, 1)).to.be.rejectedWith(
        "This contract is not whitelisted"
      );
    });

    //TODO: transferFrom when exchange contract is approved
    //TODO: transferFrom form cak should be allowed even if no bytecode whitelisted
    //TODO: test totalsupply is increased after mint

    /**
     *
     * const log = await new Promise<EventData>(async (resolve) => {
      instance.events.RegisterStatusChanged(cak.get({ fromBlock: 0 }), {}).on("log", resolve);
    });
    console.log("RegisterStatusChanged event",log)
    expect(log).not.to.be.null;
    expect(log.returnValues).not.to.be.null;
    expect(log.returnValues.emiter).to.equal(cakAddress);
    */
  });
});
