import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployRegisterContractFixture } from './deployer/register.deployer';

chai.use(chaiAsPromised);

describe('Register (Bond Issuance) contract interoperability', function () {
  let fixture: any;
  this.beforeEach(async () => {
    fixture = await loadFixture(deployRegisterContractFixture);
  });

  this.afterEach(async () => {
    fixture = null;
  });

  it('contract name be set', async () => {
    const { instance } = fixture;
    const actual = await instance.name();
    expect(actual).to.be.equal('EIB 3Y 1Bn SEK');
  });

  it('contract symbol be set', async () => {
    const { instance } = fixture;
    const actual = await instance.symbol();
    expect(actual).to.be.equal('EIB3Y');
  });

  it('contract decimal should be zero to avoid fractional BOND shares', async () => {
    const { instance } = fixture;
    const actual = await instance.decimals();
    expect(actual).to.equal('0');
  });

  it('total supply is zero after deploy', async () => {
    const { instance } = fixture;
    const actual = await instance.totalSupply();
    expect(actual).to.equal('0');
  });

  it('contract balance is zero after deploy', async () => {
    const { instance, cakAddress, instanceAddress } = fixture;
    const actual = await instance.balanceOf(cakAddress);
    expect(actual).to.equal(0);

    const contractBalance = await instance.balanceOf(instanceAddress);
    expect(contractBalance).to.equal('0');
  });

  it('allowance before mint is zero', async () => {
    const { instance, cakAddress, instanceAddress } = fixture;
    const actual = await instance.allowance(instanceAddress, cakAddress);
    expect(actual).to.equal('0');

    const contractBalance = await instance.balanceOf(instanceAddress);
    expect(contractBalance).to.equal('0');
  });

  it('balanceOf primaryIssuanceAccount should be set after mint', async function () {
    const { instance, cakAddress, instanceAddress } = fixture;
    await instance.mint(60);
    const actual = await instance.balanceOf(cakAddress);
    expect(actual).to.equal(
      '0',
      'CAK should NOT recieve the bond parts after mint'
    );

    const primaryIssuanceAccount = instanceAddress;

    const contractBalance = await instance.balanceOf(primaryIssuanceAccount);
    expect(contractBalance).to.equal('60', '');
  });

  it('approve() should be denied', async () => {
    const { instance, cakAddress, instanceAddress, strangerAddress } = fixture;
    await expect(instance.approve(strangerAddress, 30)).to.be.rejectedWith(
      'approve is disabled'
    );
  });

  it('allowance should stay zero after approve was denied', async () => {
    const { instance, cakAddress, instanceAddress, strangerAddress } = fixture;
    const actual = await instance.allowance(cakAddress, strangerAddress);
    expect(actual).to.equal('0');
  });

  it('increaseAllowance() should be denied', async () => {
    const { instance, cakAddress, instanceAddress, strangerAddress } = fixture;
    await expect(
      instance.increaseAllowance(strangerAddress, 30)
    ).to.be.rejectedWith('increaseAllowance is disabled');
  });

  it('decreaseAllowance() should be denied', async () => {
    const {
      instance,
      cakAddress,
      cakAccount,
      instanceAddress,
      strangerAddress
    } = fixture;
    await expect(
      instance.connect(cakAccount).decreaseAllowance(strangerAddress, 30)
    ).to.be.rejectedWith('decreaseAllowance is disabled');
  });

  it('transfer() should be denied', async () => {
    const {
      instance,
      cakAddress,
      cakAccount,
      instanceAddress,
      strangerAddress
    } = fixture;
    await expect(
      instance.connect(cakAccount).transfer(strangerAddress, 1)
    ).to.be.rejectedWith('transfer is disabled');
  });

  it('transferFrom() should be denied when contract is not whitelisted', async () => {
    const {
      instance,
      cakAddress,
      cakAccount,
      instanceAddress,
      strangerAddress,
      strangerAccount
    } = fixture;
    const primaryIssuanceAccount = instanceAddress;

    await expect(
      instance
        .connect(strangerAccount)
        .transferFrom(primaryIssuanceAccount, strangerAddress, 1)
    ).to.be.rejectedWith('This contract is not whitelisted');
  });

  //   //TODO: transferFrom when exchange contract is approved
  //   //TODO: transferFrom form cak should be allowed even if no bytecode whitelisted
  //   //TODO: test totalsupply is increased after mint
});
