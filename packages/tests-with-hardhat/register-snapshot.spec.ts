import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import {
  deployRegisterContractWithWhilistFixture,
  deployRegisterContractFixture,
  deployRegisterContractSnapshotFixture
} from './deployer/register.deployer';
import { makeBondDate, makeDateTime } from './utils/dates';

chai.use(chaiAsPromised);

describe('Register snapshot testing', function () {
  it('when creating the register the current stimestamp should be set', async () => {
    const { instance, cakAddress, instanceAddress, cakAccount } =
      await loadFixture(deployRegisterContractSnapshotFixture);

    const data = await instance.connect(cakAccount).getBondData();
    const currentTs = await instance
      .connect(cakAccount)
      .currentSnapshotDatetime();
    const firstCouponDates = data[9][0];
    const cutOffTime = data[10];
    expect(currentTs).to.equal(firstCouponDates + cutOffTime);
  });

  it('when CAK transfer to stranger it should update stranger balance', async () => {
    const {
      instance,
      cakAddress,
      instanceAddress,
      cakAccount,
      custodianAccount,
      custodianAddress,
      strangerAddress
    } = await loadFixture(deployRegisterContractSnapshotFixture);
    await instance.connect(cakAccount).grantCstRole(custodianAddress);
    await instance
      .connect(custodianAccount)
      .enableInvestorToWhitelist(strangerAddress);
    await instance
      .connect(cakAccount)
      .transferFrom(instanceAddress, strangerAddress, 400);
    const strangerBalance = await instance
      .connect(cakAccount)
      .balanceOf(strangerAddress);

    expect(strangerBalance).to.equal('400');
  });
  it('balanceOfCoupon returns account balance when no couponDate set', async () => {
    const {
      instance,
      cakAddress,
      instanceAddress,
      cakAccount,
      custodianAccount,
      custodianAddress,
      strangerAddress
    } = await loadFixture(deployRegisterContractSnapshotFixture);
    //TODO: maybe reveiw this logic (cycle setCurrentCouponDate + autoSnapshot + balanceOfCoupon ) ? shouldn't balanceOfCoupon revert when no coupon date set ?
    const cDate = Math.floor(new Date().getTime() / 1000);
    const couponBalance = await instance
      .connect(cakAccount)
      .balanceOfCoupon(instanceAddress, cDate);
    expect(couponBalance).to.equal('1000');
  });
  it('setCurrentCouponDate can only be called by whitelisted smart contract', async () => {
    const {
      instance,
      cakAddress,
      instanceAddress,
      cakAccount,
      custodianAccount,
      custodianAddress,
      strangerAddress
    } = await loadFixture(deployRegisterContractSnapshotFixture);
    const cDate = Math.floor(new Date().getTime() / 1000);
    await expect(
      instance
        .connect(cakAccount)
        .setCurrentCouponDate(cDate, cDate - 24 * 3600 + 17 * 3600)
    ).to.be.rejectedWith('This contract is not whitelisted');
  });
});
