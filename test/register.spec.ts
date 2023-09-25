import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployRegisterContractFixture } from './deployer/register.deployer';

chai.use(chaiAsPromised);

describe('Run tests on Register (Bond Issuance) contract', function () {
  describe('Register contract: verify mint rules', function () {
    it('CAK may mint', async function () {
      const { instance } = await loadFixture(deployRegisterContractFixture);
      const data = await instance.mint(60);
      expect(data).to.not.be.undefined;
    });

    it('CAK may mint twice and all token goes to primaryIssuanceAccount', async function () {
      const { instance, cakAddress, instanceAddress, cakAccount } =
        await loadFixture(deployRegisterContractFixture);
      await instance.connect(cakAccount).mint(10);
      await instance.connect(cakAccount).mint(10);
      const actual = await instance.balanceOf(cakAddress);

      expect(actual).to.equal(
        0,
        'CAK should NOT recieve the bond parts after mint'
      );

      const primaryIssuanceAccount = instanceAddress;
      const contractBalance = await instance
        .connect(cakAccount)
        .balanceOf(primaryIssuanceAccount);
      expect(contractBalance).to.equal(20);
    });

    it('stranger may not mint', async function () {
      const {
        instance,
        cakAddress,
        cakAccount,
        instanceAddress,
        strangerAccount,
        strangerAddress
      } = await loadFixture(deployRegisterContractFixture);
      await expect(
        instance.connect(strangerAccount).mint(30)
      ).to.be.rejectedWith('Caller must be CAK');

      const strangerBalance = await instance
        .connect(strangerAccount)
        .balanceOf(strangerAddress);
      expect(strangerBalance).to.equal(
        0,
        'strangerBalance balance should be 0 as mint should be denied'
      );

      const primaryIssuanceAccount = instanceAddress;
      const contractBalance = await instance
        .connect(cakAccount)
        .balanceOf(primaryIssuanceAccount);
      expect(contractBalance).to.equal(
        0,
        'primaryIssuanceAccount balance should be 0 as mint should be denied'
      );
    });

    //TODO: unit test stranger cannot grant himself cak role role just after the deploy
    //TODO: cannot mint if not cak (sc-deployer)
    //TODO: unit test generated event  (topics)
  });

  describe('Register contract: verify intialization', function () {
    //WARN; unit test on the same contract instance: ok if only real operation via call()

    it('CAK role should be set', async () => {
      const { instance, cakAddress, cakAccount } = await loadFixture(
        deployRegisterContractFixture
      );
      const cakRole = await instance.connect(cakAccount).CAK_ROLE();

      expect(cakRole).to.equal(
        '0xa75205b8583660bdad375c0ccde11af17668d76a408a9a5e739251b0f7c59870',
        'invalid cak_role value'
      );

      const isCak = await instance
        .connect(cakAccount)
        .hasRole(cakRole, cakAddress);
      expect(isCak).to.true;
    });

    it('stranger should NOT have the CAK role', async () => {
      const {
        instance,
        cakAddress,
        cakAccount,
        strangerAddress,
        strangerAddress2
      } = await loadFixture(deployRegisterContractFixture);
      const cakRole = await instance.connect(cakAccount).CAK_ROLE();
      expect(strangerAddress).to.not.equal(cakAddress);
      const isCak = await instance
        .connect(cakAccount)
        .hasRole(cakRole, strangerAddress);
      expect(isCak).to.false;

      const isCak2 = await instance
        .connect(cakAccount)
        .hasRole(cakRole, strangerAddress2);

      expect(isCak2).to.false;
    });

    it('CAK balance is zero', async function () {
      const { instance, cakAddress, cakAccount } = await loadFixture(
        deployRegisterContractFixture
      );
      const actual = await instance.connect(cakAccount).balanceOf(cakAddress);
      expect(actual).to.equal(0);
    });
  });
});
