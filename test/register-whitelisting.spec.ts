import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployRegisterContractWithWhilistFixture } from './deployer/register.deployer';

chai.use(chaiAsPromised);

describe('Register (Bond Issuance) whitelisting', function () {
  describe('whitelist investor', function () {
    it('investorsAllowed should return false as no investor whitelisted after contrat deploy', async () => {
      const { instance, cakAccount, investorAddress } = await loadFixture(
        deployRegisterContractWithWhilistFixture
      );

      const actual = await instance
        .connect(cakAccount)
        .investorsAllowed(investorAddress);
      expect(actual).to.equal(false);
    });

    it('investorsAllowed should return true after whitelisting', async () => {
      const { instance, cakAccount, custodianAccount, investorAddress } =
        await loadFixture(deployRegisterContractWithWhilistFixture);
      await instance
        .connect(custodianAccount)
        .enableInvestorToWhitelist(investorAddress);
      const actual = await instance
        .connect(cakAccount)
        .investorsAllowed(investorAddress);
      expect(actual).to.equal(true);
    });

    it('TO BE CHECKED Cst role should be able to remove investors ?', async () => {
      const { instance, cakAccount, custodianAccount, investorAddress } =
        await loadFixture(deployRegisterContractWithWhilistFixture);
      await instance
        .connect(custodianAccount)
        .enableInvestorToWhitelist(investorAddress);

      const actual_enabled = await instance
        .connect(cakAccount)
        .investorsAllowed(investorAddress);

      expect(actual_enabled).to.equal(true);

      await instance
        .connect(custodianAccount)
        .disableInvestorFromWhitelist(investorAddress);

      const actual_disabled = await instance
        .connect(cakAccount)
        .investorsAllowed(investorAddress);

      expect(actual_disabled).to.equal(false);
    });
  });
});
