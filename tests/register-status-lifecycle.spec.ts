import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import Web3 from "web3";
import Ganache from "ganache";
import { Web3FunctionProvider } from "@saturn-chain/web3-functions";
import { EthProviderInterface } from "@saturn-chain/dlt-tx-data-functions";

import allContracts from "../contracts";
import { SmartContract, SmartContractInstance } from "@saturn-chain/smart-contract";
import { blockGasLimit, makeReadyGas, mintGas, registerGas } from "./gas.constant";
import { makeBondDate } from "./dates";

const RegisterContractName = "Register";
const PrimaryIssuanceContractName = "PrimaryIssuance";

describe("Register (Bond Issuance)", function () {
  this.timeout(10000);
  let web3: Web3;
  let cak: EthProviderInterface;
  let custodian: EthProviderInterface;
  let stranger: EthProviderInterface;
  let bnd: EthProviderInterface;
  let registerInstance: SmartContractInstance;
  let Register: SmartContract;
  let cakAddress: string;
  let investorAddress: string;
  let custodianAddress: string;
  let strangerAddress: string;
  let bndAddress: string;

  async function deployRegisterContract(): Promise<void> {
    web3 = new Web3(Ganache.provider({ default_balance_ether: 1000, gasLimit: blockGasLimit, chain: {vmErrorsOnRPCResponse:true} }) as any);
    cak = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[0]));
    stranger = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[1]));
    custodian = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[2]));
    bnd = new Web3FunctionProvider(web3.currentProvider, (list) => Promise.resolve(list[3]));

    cakAddress = await cak.account();
    investorAddress = await cak.account();
    custodianAddress = await custodian.account();
    strangerAddress = await stranger.account();
    bndAddress = await bnd.account();
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
      registerInstance = await Register.deploy(
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
  }
  describe("status lifecyle", function () {
    beforeEach(async () => {
      await deployRegisterContract();
      //NOTE: only one Bond contract is deployed within this describe() scope
    });

    it("should be draft after deploy", async () => {
      const actual = await registerInstance.status(cak.call());
      expect(actual).to.equal("0");
    });

    it("should still be Draft after mint as mint does not affect lifecyle (not process related)", async () => {
      await registerInstance.mint(cak.send({ maxGas: mintGas }), 1000);
      const actual = await registerInstance.status(cak.call());
      expect(actual).to.equal("0");
    });

    it("should be ready after makeReady", async () => {
      await registerInstance.setExpectedSupply(cak.send({ maxGas: 100000 }), 1000);
      await registerInstance.makeReady(cak.send({ maxGas: makeReadyGas }));
      const actual = await registerInstance.status(cak.call());
      const supply = await registerInstance.totalSupply(cak.call());
      expect(actual).to.equal("1");
      expect(supply).to.equal(`1000`);
    });


    it("should be revert to Draft after makeReady", async () => {
      // GIVEN the bond is in ready state
      await registerInstance.setExpectedSupply(cak.send({ maxGas: 100000 }), 1000);
      await registerInstance.makeReady(cak.send({ maxGas: makeReadyGas }));
      
      // WHEN the CAK decide to revert 
      await registerInstance.revertReady(cak.send({ maxGas: makeReadyGas }));
      const actual = await registerInstance.status(cak.call());
      const supply = await registerInstance.totalSupply(cak.call());
      expect(actual).to.equal("0");
      expect(supply).to.equal(`0`);
    });

    it("should be Issued after issuance approval", async () => {
      // implicit: register has been minted

      await registerInstance.grantBndRole(cak.send({ maxGas: 100000 }), bndAddress);
      const primaryInstance = await allContracts
        .get(PrimaryIssuanceContractName)
        .deploy(bnd.newi({ maxGas: 1000000 }), registerInstance.deployedAt, 1500);

      //whitelist the Primary
      let primaryHash = await registerInstance.atReturningHash(cak.call(), primaryInstance.deployedAt);
      await registerInstance.enableContractToWhitelist(cak.send({ maxGas: 100000 }), primaryHash);
      const before = await registerInstance.status(stranger.call());
      await registerInstance.grantCstRole(cak.send({maxGas:100000}), await custodian.account());
      await registerInstance.enableInvestorToWhitelist(custodian.send({maxGas:120000}), bndAddress); // needed to deploy a test trade contract
   
      await registerInstance.makeReady(cak.send({ maxGas: makeReadyGas }));

      //Act
      const txValidatePrimary = await primaryInstance.validate(bnd.send({ maxGas: 220000 }));
      // console.log((await web3.eth.getTransactionReceipt(txValidatePrimary)).logs); //uncomment this for debugging


      const actual = await registerInstance.status(stranger.call());
      expect(actual).to.equal("2", "register status should be 'Issued' after finalize was called");
    });

    //TODO: Repaid status ? (Register : Draft / Cancel / Ready / Issued / Repaid)
  });

  describe('bond reparation', () => {
    beforeEach(async () => {
      await deployRegisterContract();
      //NOTE: only one Bond contract is deployed within this describe() scope
      await registerInstance.grantBndRole(cak.send({ maxGas: 100000 }), bndAddress);
    });

    it('It should create a new bond, force some balances then force its issuance', async () => {

      // Deploy the Primary issuance smart contract
      const primaryInstance = await allContracts
        .get(PrimaryIssuanceContractName)
        .deploy(bnd.newi({ maxGas: 1000000 }), registerInstance.deployedAt, 100*10000);

      //whitelist the Primary Issuance contract
      let primaryHash = await registerInstance.atReturningHash(cak.call(), primaryInstance.deployedAt);
      await registerInstance.enableContractToWhitelist(cak.send({ maxGas: 100000 }), primaryHash);

      // Set the register in Ready state that sets the primary issuance account to the total Supply
      await registerInstance.makeReady(cak.send({ maxGas: makeReadyGas }));

      const totalSupply = Number.parseInt(await registerInstance.totalSupply(cak.call()));
      const intitialPrimaryIssuanceBal = Number.parseInt(await registerInstance.balanceOf(cak.call(), registerInstance.deployedAt));
      
      // Send 300 to investor
      await registerInstance.transferFrom(cak.send({maxGas: 500_000}), registerInstance.deployedAt, investorAddress, 300)
      const step2_PrimaryIssuanceBal = Number.parseInt(await registerInstance.balanceOf(cak.call(), registerInstance.deployedAt));
      
      
      // Purchase the bond 
      const txValidatePrimary = await primaryInstance.validate(bnd.send({ maxGas: 250000 }));
      const details = await primaryInstance.getDetails(bnd.call());
      const step3_PrimaryIssuanceBal = Number.parseInt(await registerInstance.balanceOf(cak.call(), registerInstance.deployedAt));

      console.log("Balances: ", {intitialPrimaryIssuanceBal, step2_PrimaryIssuanceBal, step3_PrimaryIssuanceBal, details, });
      

      expect(totalSupply).eq(1000);
      expect(intitialPrimaryIssuanceBal).eq(totalSupply)
      expect(totalSupply).eq(step2_PrimaryIssuanceBal + 300)
      expect(step3_PrimaryIssuanceBal).eq(0)
      expect(totalSupply).eq(Number.parseInt(details.quantity) + 300)

    });
  });
});
