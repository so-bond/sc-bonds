import Web3 from 'web3';
import { SmartContract } from '@saturn-chain/smart-contract';
import { makeBondDate, addPart } from '../utils/dates';
import { ethers } from 'hardhat';
import Ganache from 'ganache';
import { blockGasLimit } from '../utils/gas.constant';

export async function deployCouponContractFixture(
  nbCoupons: number = 3,
  couponSpaceSec: number = 2 * 24 * 3600
): Promise<any> {
  let web3: Web3;

  let registerInstance: any;
  let Register: SmartContract | any;

  const [
    cak,
    bnd,
    payer,
    custodianA,
    custodianB,
    investorA,
    investorB,
    investorC,
    investorD,
    wrongAccount,
    stranger,
    stranger2,
    stranger3,
    stranger4,
    stranger5,
    stranger6
  ] = await ethers.getSigners();

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
  const expectedSupply = 5000;

  const firstCouponDate = dates.couponDates[0];

  // TODO: fix this to be a normal string
  const currency = web3.utils.soliditySha3('SEK');

  const unitVal = 100000;
  const couponRate = 0.4 * 100 * 10_000;
  const creationDate = dates.creationDate;
  const issuanceDate = dates.issuanceDate;
  const maturityDate = dates.maturityDate;
  const couponDates = dates.couponDates;
  const defaultCutofftime = dates.defaultCutofftime;

  Register = await ethers.getContractFactory('Register');

  registerInstance = await Register.deploy(
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

  const registerInstanceAddress = await registerInstance.getAddress();
  await registerInstance.connect(cak).grantBndRole(bnd.address);
  await registerInstance.connect(cak).grantCstRole(custodianA.address);
  await registerInstance.connect(cak).grantCstRole(custodianB.address);
  await registerInstance.connect(cak).grantPayRole(payer.address);

  await registerInstance
    .connect(custodianA)
    .enableInvestorToWhitelist(investorA.address);
  await registerInstance
    .connect(custodianA)
    .enableInvestorToWhitelist(investorB.address);
  await registerInstance
    .connect(custodianA)
    .enableInvestorToWhitelist(investorC.address);
  await registerInstance
    .connect(custodianA)
    .enableInvestorToWhitelist(investorD.address);

  await registerInstance.connect(cak).makeReady();

  const PrimaryIssuance = await ethers.getContractFactory('PrimaryIssuance');

  const primaryIssuanceInstance = await PrimaryIssuance.connect(bnd).deploy(
    registerInstanceAddress,
    100
  );

  const primaryIssuanceInstanceAddress =
    await primaryIssuanceInstance.getAddress();

  await registerInstance.connect(bnd).balanceOf(bnd.address);

  let hash1 = await registerInstance
    .connect(cak)
    .atReturningHash(primaryIssuanceInstanceAddress);

  await registerInstance.connect(cak).enableContractToWhitelist(hash1);

  await primaryIssuanceInstance.connect(bnd).validate();

  //deploy bilateral trade
  const BilateralTrade = await ethers.getContractFactory('BilateralTrade');

  const tradeInstance = await BilateralTrade.connect(bnd).deploy(
    registerInstanceAddress,
    investorA.address
  );

  const trandInstanceAddress = await tradeInstance.getAddress();

  let hash2 = await registerInstance
    .connect(cak)
    .atReturningHash(trandInstanceAddress);

  await registerInstance.connect(cak).enableContractToWhitelist(hash2);

  let _details: any = await tradeInstance.connect(bnd).details();
  let details: any = {};
  details.quantity = 155;
  details.buyer = _details.buyer;
  details.tradeDate = addPart(dates.issuanceDate, 'D', 1); //Date.UTC(2022, 9, 10) / (1000*3600*24);
  details.valueDate = addPart(dates.issuanceDate, 'D', 2); // Date.UTC(2022, 9, 12) / (1000*3600*24);
  details.price = 101 * 10_000;

  await tradeInstance.connect(bnd).setDetails(details);
  await tradeInstance.connect(bnd).approve();
  await tradeInstance.connect(investorA).approve();
  await tradeInstance.connect(bnd).executeTransfer();

  return {
    registerInstance,
    payer,
    web3,
    registerInstanceAddress,

    // account
    cakAccount: cak,
    strangerAccount: stranger,
    strangerAccount2: stranger2,
    strangerAccount3: stranger3,
    strangerAccount4: stranger4,
    strangerAccount5: stranger5,
    strangerAccount6: stranger6,
    investorA,
    investorB,
    investorC,
    investorD,
    wrongAccount,
    bnd,

    // address
    cakAddress,
    strangerAddress,
    strangerAddress2,
    strangerAddress3: stranger3.address,
    strangerAddress4: stranger4.address,
    strangerAddress5: stranger5.address,
    strangerAddress6: stranger6.address,
    //
    firstCouponDate,
    maturityDate,
    expectedSupply
  };
}
