import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import Web3 from 'web3';
import {
  SmartContract,
  SmartContractInstance
} from '@saturn-chain/smart-contract';
import { makeBondDate } from '../utils/dates';
import { ethers } from 'hardhat';
import Ganache from 'ganache';
import { blockGasLimit } from '../utils/gas.constant';

export async function deployRegisterContractEvent(
  nbCoupons: number = 3,
  couponSpaceSec: number = 30 * 24 * 3600
): Promise<any> {
  let web3: Web3;

  const [cak, stranger, stranger2, stranger3, stranger4, stranger5, stranger6] =
    await ethers.getSigners();
  web3 = new Web3();

  let cakAddress = cak.address;
  let strangerAddress = stranger.address;
  let strangerAddress2 = stranger2.address;

  const dates = makeBondDate(nbCoupons, couponSpaceSec);
  const bondName = 'EIB 3Y 1Bn SEK';
  const isin = 'EIB3Y';
  const expectedSupply = 1000;
  // TODO: fix this to be a normal string
  const currency = web3.utils.soliditySha3('SEK');
  // const currency = web3.utils.soliditySha3("SEK");

  const unitVal = 100000;
  const couponRate = web3.utils.asciiToHex('0.4');
  const creationDate = dates.creationDate;
  const issuanceDate = dates.issuanceDate;
  const maturityDate = dates.maturityDate;
  const couponDates = dates.couponDates;
  const defaultCutofftime = dates.defaultCutofftime;

  return {
    // instance,
    web3,
    // instanceAddress,
    // account
    cakAccount: cak,
    strangerAccount: stranger,
    strangerAccount2: stranger2,
    strangerAccount3: stranger3,
    strangerAccount4: stranger4,
    strangerAccount5: stranger5,
    strangerAccount6: stranger6,
    // address
    cakAddress,
    strangerAddress,
    strangerAddress2,
    strangerAddress3: stranger3.address,
    strangerAddress4: stranger4.address,
    strangerAddress5: stranger5.address,
    strangerAddress6: stranger6.address,
    input: {
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
    }
  };
}

async function _deployRegisterContractFixture(
  nbCoupons: number = 3,
  couponSpaceSec: number = 30 * 24 * 3600,
  couponRateValue: number = 0
): Promise<any> {
  let web3: Web3;

  let instance: SmartContractInstance | any;
  let Register: SmartContract | any;

  const [cak, stranger, stranger2, stranger3, stranger4, stranger5, stranger6] =
    await ethers.getSigners();

  web3 = new Web3(
    Ganache.provider({
      default_balance_ether: 1000,
      gasLimit: blockGasLimit,
      chain: { vmErrorsOnRPCResponse: true }
    }) as any
  );

  let cakAddress = cak.address;
  let strangerAddress = stranger.address;
  let strangerAddress2 = stranger2.address;

  const dates = makeBondDate(nbCoupons, couponSpaceSec);
  const bondName = 'EIB 3Y 1Bn SEK';
  const isin = 'EIB3Y';
  const expectedSupply = 1000;
  // TODO: fix this to be a normal string
  const currency = web3.utils.soliditySha3('SEK');
  // const currency = web3.utils.soliditySha3("SEK");

  const unitVal = 100000;
  const couponRate = couponRateValue
    ? couponRateValue
    : web3.utils.asciiToHex('0.4');
  const creationDate = dates.creationDate;
  const issuanceDate = dates.issuanceDate;
  const maturityDate = dates.maturityDate;
  const couponDates = dates.couponDates;
  const defaultCutofftime = dates.defaultCutofftime;

  Register = await ethers.getContractFactory('Register');
  instance = await Register.deploy(
    // cak.newi({ maxGas: registerGas }),
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

  const instanceAddress = await instance.getAddress();

  return {
    instance,
    web3,
    instanceAddress,
    // account
    cakAccount: cak,
    strangerAccount: stranger,
    strangerAccount2: stranger2,
    strangerAccount3: stranger3,
    strangerAccount4: stranger4,
    strangerAccount5: stranger5,
    strangerAccount6: stranger6,
    // address
    cakAddress,
    strangerAddress,
    strangerAddress2,
    strangerAddress3: stranger3.address,
    strangerAddress4: stranger4.address,
    strangerAddress5: stranger5.address,
    strangerAddress6: stranger6.address
  };
}

export async function deployRegisterContractFixture(): Promise<any> {
  return _deployRegisterContractFixture(2);
}

export async function deployRegisterContractBondDataFixture(): Promise<any> {
  return _deployRegisterContractFixture(
    3,
    12 * 30 * 24 * 3600,
    0.4 * 100 * 10000
  );
}

export async function deployRegisterContractWithWhilistFixture(): Promise<any> {
  const {
    instance,
    web3,
    instanceAddress,
    strangerAccount,
    strangerAccount2,
    cakAccount,
    cakAddress,
    strangerAddress,
    strangerAddress2
  } = await _deployRegisterContractFixture(2, 12 * 30 * 24 * 3600);
  const investorAccount = strangerAccount;
  const investorAddress = strangerAddress;
  const custodianAccount = strangerAccount2;
  const custodianAddress = strangerAddress2;

  await instance.connect(cakAccount).grantCstRole(custodianAddress);

  return {
    instance,
    web3,
    instanceAddress,
    // account
    cakAccount,
    investorAccount,
    custodianAccount,
    // address
    cakAddress,
    investorAddress,
    custodianAddress
  };
}

export async function deployRegisterContractSnapshotFixture(): Promise<any> {
  const {
    instance,
    web3,
    instanceAddress,
    strangerAccount,
    strangerAccount2,
    strangerAccount3,
    strangerAccount4,
    cakAccount,
    cakAddress,
    strangerAddress,
    strangerAddress2,
    strangerAddress3
  } = await _deployRegisterContractFixture(2, 12 * 30 * 24 * 3600);

  const custodianAccount = strangerAccount4;
  const custodianAddress = strangerAccount4.address;

  // create some balance on the primary issuance account
  await instance.connect(cakAccount).mint(1000);

  return {
    instance,
    web3,
    instanceAddress,
    // account
    cakAccount,
    strangerAccount,
    strangerAccount2,
    strangerAccount3,
    custodianAccount,
    // address
    cakAddress,
    strangerAddress,
    strangerAddress2,
    strangerAddress3,
    custodianAddress
  };
}

export async function deployRegisterContractAccessManagementFixture(): Promise<any> {
  const {
    instance,
    web3,
    instanceAddress,
    strangerAccount,
    strangerAccount2,
    strangerAccount3,
    strangerAccount4,
    cakAccount,
    cakAddress,
    strangerAddress,
    strangerAddress2,
    strangerAddress3
  } = await _deployRegisterContractFixture(2, 12 * 30 * 24 * 3600);

  const otherCakAccount = strangerAccount2;
  const otherCakAddress = strangerAccount2.address;
  const custodianAccount = strangerAccount4;
  const custodianAddress = strangerAccount4.address;

  const cakRole = await instance.connect(strangerAccount).CAK_ROLE();
  const bndRole = await instance.connect(strangerAccount).BND_ROLE();
  const custodianRole = await instance.connect(strangerAccount).CST_ROLE();
  const payRole = await instance.connect(strangerAccount).PAY_ROLE();
  const defaultAdminRole = await instance
    .connect(strangerAccount)
    .DEFAULT_ADMIN_ROLE();

  return {
    instance,
    web3,
    instanceAddress,
    // account
    cakAccount,
    strangerAccount,
    otherCakAccount,
    strangerAccount3,
    custodianAccount,
    // address
    cakAddress,
    strangerAddress,
    otherCakAddress,
    strangerAddress3,
    custodianAddress,
    // role
    cakRole,
    bndRole,
    custodianRole,
    payRole,
    defaultAdminRole
  };
}
