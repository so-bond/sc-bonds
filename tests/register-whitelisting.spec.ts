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
import { makeBondDate } from "./dates";

const RegisterContractName = "Register";

describe("Register (Bond Issuance) whitelisting", function () {
  this.timeout(10000);
  let web3: Web3;
  let cak: EthProviderInterface;
  let custodian: EthProviderInterface;
  let stranger: EthProviderInterface;
  let instance: SmartContractInstance;
  let Register: SmartContract;
  let cakAddress: string;
  let investorAddress: string;
  let custodianAddress: string;

  async function deployRegisterContract(): Promise<void> {
    web3 = new Web3(Ganache.provider({ default_balance_ether: 1000, gasLimit: blockGasLimit, chain: {vmErrorsOnRPCResponse:true} }) as any);
    cak = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[0]));
    stranger = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[1]));
    custodian = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[2]));
    cakAddress = await cak.account(0);
    investorAddress = await cak.account(1);
    custodianAddress = await custodian.account();

    const dates = makeBondDate(2, 12*30*24*3600)
    const bondName = "EIB 3Y 1Bn SEK";
    const isin = "EIB3Y";
    const expectedSupply = 1000;
    const currency = web3.utils.asciiToHex("SEK");
    const unitVal = 100000;
    const couponRate = web3.utils.asciiToHex("0.4");
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
    await instance.grantCstRole(cak.send({maxGas:100000}), await custodian.account());

  }
  describe("whitelist investor", function () {
    before(async () => {
      await deployRegisterContract();
      //NOTE: only one contract is deployed within this describe() scope
    });

    it("investorsAllowed should return false as no investor whitelisted after contrat deploy", async () => {
      const actual = await instance.investorsAllowed(cak.call(), investorAddress);
      expect(actual).to.equal(false);
    });

    it("TO BE CHECKED CAK should be able to whitelist investors ?", async () => {
      await instance.enableInvestorToWhitelist(custodian.send({ maxGas: 130000 }), investorAddress);


    });

    it("investorsAllowed should return true after whitelisting", async () => {
      const actual = await instance.investorsAllowed(cak.call(), investorAddress);
      expect(actual).to.equal(true);
    });

    it("TO BE CHECKED CAK should be able to remove investors ?", async () => {
      await instance.disableInvestorFromWhitelist(custodian.send({ maxGas: 130000 }), investorAddress);
    });

    it("investorsAllowed should return false after whitelisting removal", async () => {
      const actual = await instance.investorsAllowed(cak.call(), investorAddress);
      expect(actual).to.equal(false);
    });
  });
});
