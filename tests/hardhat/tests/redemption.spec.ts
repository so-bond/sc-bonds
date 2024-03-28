import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import chai, { expect } from 'chai';
import { deployCouponContractFixture } from './deployer/coupon.deployer';
import { ethers } from 'hardhat';
import { addPart, today } from './utils/dates';
import { bilateralTrade } from './utils/shared';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('Run tests of the Redemption contract', function () {
  describe('Redemption process', function () {
    it('should fail to deploy the redemption when maturity date is not known by the register', async function () {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        firstCouponDate
      } = await loadFixture(deployCouponContractFixture);

      const isPay = await registerInstance.connect(payer).isPay(payer.address);
      expect(isPay).to.be.true;

      const BilateralTrade = await ethers.getContractFactory('Redemption');
      const trade = BilateralTrade.connect(payer).deploy(
        registerInstanceAddress,
        firstCouponDate,
        360,
        addPart(firstCouponDate, 'D', -1),
        1500
      );

      await expect(trade).to.be.rejectedWith(
        'this maturity Date does not exists'
      );
    });

    it('should deploy the redemption and get maturity amount for investor', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        firstCouponDate,
        maturityDate,
        investorA,
        cakAccount
      } = await loadFixture(deployCouponContractFixture);

      const isPay = await registerInstance.connect(payer).isPay(payer.address);
      expect(isPay).to.be.true;
      const Redemption = await ethers.getContractFactory('Redemption');
      const redemptionInstance = await Redemption.connect(payer).deploy(
        registerInstanceAddress,
        maturityDate,
        360,
        addPart(maturityDate, 'D', -1),
        1500
      );
      let balenceOfInvestorA = await registerInstance
        .connect(payer)
        .balanceOfCoupon(investorA.address, maturityDate);
      let unitValue = await registerInstance
        .connect(cakAccount)
        .getBondUnitValue();
      let maturityAmount = unitValue * balenceOfInvestorA;
      const actual = await redemptionInstance
        .connect(payer)
        .getMaturityAmountForInvestor(investorA.address);
      expect(actual).to.equal(maturityAmount.toString());
    });

    it('should try to toggle Redemption Payment but revert as the investor is not allowed', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        firstCouponDate,
        maturityDate,
        investorA,
        cakAccount,
        wrongAccount
      } = await loadFixture(deployCouponContractFixture);

      const isPay = await registerInstance.connect(payer).isPay(payer.address);
      expect(isPay).to.be.true;
      const Redemption = await ethers.getContractFactory('Redemption');
      const redemptionInstance = await Redemption.connect(payer).deploy(
        registerInstanceAddress,
        maturityDate,
        360,
        addPart(maturityDate, 'D', -1),
        1500
      );
      const redemptionInstanceAddress = await redemptionInstance.getAddress();
      const redemptionInstance1 = await Redemption.connect(payer).deploy(
        registerInstanceAddress,
        maturityDate,
        10,
        addPart(maturityDate, 'D', -1),
        1500
      );
      const redemptionInstanceAddress1 = await redemptionInstance1.getAddress();

      //whitelist redemption contract into register
      let hash = await registerInstance
        .connect(cakAccount)
        .atReturningHash(redemptionInstanceAddress);

      let hash1 = await registerInstance
        .connect(cakAccount)
        .atReturningHash(redemptionInstanceAddress1);

      expect(hash).to.equal(hash1);

      await registerInstance
        .connect(cakAccount)
        .enableContractToWhitelist(hash);

      await redemptionInstance.connect(payer).setDateAsCurrentCoupon();

      await expect(
        redemptionInstance
          .connect(payer)
          .toggleRedemptionPayment(wrongAccount.address)
      ).to.be.rejectedWith('This investor is not allowed');
    });

    it('should try to toggle Redemption Payment but revert as the maturity cut off time has not passed', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        firstCouponDate,
        maturityDate,
        investorA,
        cakAccount,
        wrongAccount
      } = await loadFixture(deployCouponContractFixture);

      const isPay = await registerInstance.connect(payer).isPay(payer.address);
      expect(isPay).to.be.true;
      const Redemption = await ethers.getContractFactory('Redemption');
      const redemptionInstance = await Redemption.connect(payer).deploy(
        registerInstanceAddress,
        maturityDate,
        360,
        addPart(maturityDate, 'D', -1),
        1500
      );
      const redemptionInstanceAddress = await redemptionInstance.getAddress();
      //whitelist redemption contract into register
      let hash = await registerInstance
        .connect(cakAccount)
        .atReturningHash(redemptionInstanceAddress);

      await registerInstance
        .connect(cakAccount)
        .enableContractToWhitelist(hash);

      await redemptionInstance.connect(payer).setDateAsCurrentCoupon();
      const paymentsResponse = redemptionInstance
        .connect(cakAccount)
        .toggleRedemptionPayment(investorA.address);
      await expect(paymentsResponse).to.be.rejectedWith(
        'the maturity cut of time has not passed'
      );
    });

    it('should try to toggle Redemption Payment after coupon process', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        firstCouponDate,
        maturityDate,
        investorA,
        cakAccount,
        wrongAccount,
        web3,
        bnd,
        investorB,
        investorD
      } = await loadFixture(deployCouponContractFixture);

      const isPay = await registerInstance.connect(payer).isPay(payer.address);
      expect(isPay).to.be.true;
      let couponDate = firstCouponDate;

      let nbDaysInPeriod = 180;
      let cutOffTimeInSec = 16 * 3600;
      const Coupon = await ethers.getContractFactory('Coupon');
      const couponInstance = await Coupon.connect(payer).deploy(
        registerInstanceAddress,
        couponDate,
        nbDaysInPeriod,
        addPart(couponDate, 'D', -1),
        cutOffTimeInSec
      );
      const couponInstanceAddress = await couponInstance.getAddress();

      let hash = await registerInstance
        .connect(cakAccount)
        .atReturningHash(couponInstanceAddress);

      await registerInstance
        .connect(cakAccount)
        .enableContractToWhitelist(hash);

      await couponInstance.connect(payer).setDateAsCurrentCoupon(); //implicit coupon validation
      time.increaseTo(couponDate + cutOffTimeInSec + 1000);
      // await mineBlock(couponDate + cutOffTimeInSec + 1000); // pass the cut of time

      // in init, investorA balance was set to 155
      const balanceOfInvestorA = await registerInstance
        .connect(cakAccount)
        .balanceOf(investorA.address);
      expect(balanceOfInvestorA).to.equal(155);
      // triggers the previous snapshot and sets investorB balance to 100
      await registerInstance
        .connect(cakAccount)
        .transferFrom(bnd.address, investorB.address, 100);

      const balanceOfInvestorB = await registerInstance
        .connect(cakAccount)
        .balanceOf(investorB.address);

      expect(balanceOfInvestorB).to.equal(100);

      const Redemption = await ethers.getContractFactory('Redemption');

      const redemptionInstance = await Redemption.connect(payer).deploy(
        registerInstanceAddress,
        maturityDate,
        nbDaysInPeriod,
        addPart(maturityDate, 'D', -1),
        cutOffTimeInSec
      );

      const redemptionInstanceAddress = await redemptionInstance.getAddress();

      let redemptionPaymentStatus = await redemptionInstance
        .connect(payer)
        .getInvestorRedemptionPayments(investorA.address);

      expect(redemptionPaymentStatus).to.equal(0);

      let hash1 = await registerInstance
        .connect(cakAccount)
        .atReturningHash(redemptionInstanceAddress);

      // enable redemption contract to whitelist
      await registerInstance
        .connect(cakAccount)
        .enableContractToWhitelist(hash1);

      await redemptionInstance.connect(payer).setDateAsCurrentCoupon(); //implicit coupon validation

      await registerInstance
        .connect(cakAccount)
        .transferFrom(bnd.address, investorA.address, 100);

      time.increaseTo(addPart(maturityDate, 'D', -1) + cutOffTimeInSec + 1000);

      await redemptionInstance
        .connect(cakAccount)
        .toggleRedemptionPayment(investorA.address);

      await redemptionInstance
        .connect(cakAccount)
        .toggleRedemptionPayment(investorB.address);

      await expect(
        registerInstance
          .connect(cakAccount)
          .transferFrom(bnd.address, investorD.address, 666)
      ).to.be.revertedWith(
        'the register is locked because no coupon is prepared or the maturity is reached'
      );
    });

    it('should try to close the register and burn the total balance', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        firstCouponDate,
        maturityDate,
        investorA,
        cakAccount,
        wrongAccount,
        web3,
        bnd,
        investorB,
        investorD,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);

      let couponDate = firstCouponDate;
      let recordDate = addPart(couponDate, 'D', -1);

      let nbDaysInPeriod = 180;
      let cutOffTimeInSec = 16 * 3600;

      // Nedd all balances to be in an investor, not in the BnD
      const bndBalance = await registerInstance
        .connect(cakAccount)
        .balanceOf(bnd.address);
      const investorBBalance = await registerInstance
        .connect(cakAccount)
        .balanceOf(investorB.address);
      expect(investorBBalance).to.equal(0);

      // make a transfer between investors
      await bilateralTrade(
        registerInstance,
        bnd,
        investorB,
        bndBalance,
        today()
      );

      const investorBBalanceAfterTrade = await registerInstance
        .connect(cakAccount)
        .balanceOf(investorB.address);
      expect(investorBBalanceAfterTrade).to.equal(bndBalance);

      const bndBalanceAfterTrade = await registerInstance
        .connect(cakAccount)
        .balanceOf(bnd.address);
      expect(bndBalanceAfterTrade).to.equal(0);

      const Coupon = await ethers.getContractFactory('Coupon');
      const couponInstance = await Coupon.connect(payer).deploy(
        registerInstanceAddress,
        couponDate,
        nbDaysInPeriod,
        recordDate,
        cutOffTimeInSec
      );
      const couponInstanceAddress = await couponInstance.getAddress();
      let hash = await registerInstance
        .connect(cakAccount)
        .atReturningHash(couponInstanceAddress);

      //enableContractToWhitelist
      await registerInstance
        .connect(cakAccount)
        .enableContractToWhitelist(hash);

      await couponInstance.connect(payer).setDateAsCurrentCoupon();

      time.increaseTo(recordDate + cutOffTimeInSec + 1000);

      recordDate = addPart(maturityDate, 'D', -1);

      const Redemption = await ethers.getContractFactory('Redemption');

      const redemptionInstance = await Redemption.connect(payer).deploy(
        registerInstanceAddress,
        maturityDate,
        nbDaysInPeriod,
        recordDate,
        cutOffTimeInSec
      );

      const redemptionInstanceAddress = await redemptionInstance.getAddress();

      //whitelist redemption contract into register
      let hash1 = await registerInstance
        .connect(cakAccount)
        .atReturningHash(redemptionInstanceAddress);
      //enableContractToWhitelist
      await registerInstance
        .connect(cakAccount)
        .enableContractToWhitelist(hash1);

      //setDateAsCurrentCoupon
      await redemptionInstance.connect(payer).setDateAsCurrentCoupon();

      // make a transfer between investors
      await bilateralTrade(registerInstance, investorB, investorD, 20, today());

      time.increaseTo(recordDate + cutOffTimeInSec + 1000);

      const investorsAtMaturity: string[] = await registerInstance
        .connect(payer)
        .getInvestorListAtCoupon(maturityDate);

      expect(investorsAtMaturity).not.include(bnd.address);

      const balancesAtMaturity = await Promise.all(
        investorsAtMaturity.map((investorAddress: any) =>
          registerInstance
            .connect(payer)
            .balanceOfCoupon(investorAddress, maturityDate)
            .then((balance: any) => {
              return {
                address: investorAddress,
                bal: Number.parseInt(balance)
              };
            })
        )
      );
      const totalBalance = balancesAtMaturity.reduce(
        (acc: any, curr: any) => acc + curr.bal,
        0
      );
      expect(totalBalance).eq(expectedSupply);

      await redemptionInstance
        .connect(cakAccount)
        .toggleRedemptionPayment(investorA.address);

      await redemptionInstance
        .connect(cakAccount)
        .toggleRedemptionPayment(investorB.address);

      await redemptionInstance
        .connect(cakAccount)
        .toggleRedemptionPayment(investorD.address);

      const totalSupply = await registerInstance
        .connect(cakAccount)
        .totalSupply();
      const primaryIssuanceBalance = await registerInstance
        .connect(cakAccount)
        .balanceOf(registerInstanceAddress);

      expect(primaryIssuanceBalance).to.equal(totalSupply);
      // burn
      await registerInstance.connect(cakAccount).burn(totalSupply);

      await expect(
        registerInstance.connect(cakAccount).mint(1000)
      ).to.be.rejectedWith(/the Register is closed/i);
    });

    it('should not manage to perform a trade after the redemption cut off time', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        firstCouponDate,
        maturityDate,
        investorA,
        cakAccount,
        wrongAccount,
        web3,
        bnd,
        investorB,
        investorD,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);

      let couponDate = firstCouponDate;
      let recordDate = addPart(couponDate, 'D', -1);

      let nbDaysInPeriod = 180;
      let cutOffTimeInSec = 16 * 3600;

      // Nedd all balances to be in an investor, not in the BnD
      const bndBalance = await registerInstance.balanceOf(bnd.address);
      // await register.transferFrom(cak.send({maxGas: 500000}), await bnd.account(), await investorD.account(), bndBalance);
      await bilateralTrade(
        registerInstance,
        bnd,
        investorD,
        bndBalance,
        today()
      );

      const Coupon = await ethers.getContractFactory('Coupon');
      const couponInstance = await Coupon.connect(payer).deploy(
        registerInstanceAddress,
        couponDate,
        nbDaysInPeriod,
        recordDate,
        cutOffTimeInSec
      );
      const couponInstanceAddress = await couponInstance.getAddress();
      let hash = await registerInstance
        .connect(cakAccount)
        .atReturningHash(couponInstanceAddress);

      // enableContractToWhitelist
      await registerInstance
        .connect(cakAccount)
        .enableContractToWhitelist(hash);

      await couponInstance.connect(payer).setDateAsCurrentCoupon();

      await time.increaseTo(recordDate + cutOffTimeInSec + 1000);
      recordDate = addPart(maturityDate, 'D', -1);

      const Redemption = await ethers.getContractFactory('Redemption');

      const redemptionInstance = await Redemption.connect(payer).deploy(
        registerInstanceAddress,
        maturityDate,
        nbDaysInPeriod,
        recordDate,
        cutOffTimeInSec
      );

      const redemptionInstanceAddress = await redemptionInstance.getAddress();
      //whitelist redemption contract into register

      let hash1 = await registerInstance
        .connect(cakAccount)
        .atReturningHash(redemptionInstanceAddress);
      //enableContractToWhitelist
      await registerInstance
        .connect(cakAccount)
        .enableContractToWhitelist(hash1);

      await redemptionInstance.connect(payer).setDateAsCurrentCoupon();

      // make a transfer between investors
      await bilateralTrade(registerInstance, investorD, investorB, 20, today());

      await time.increaseTo(maturityDate + cutOffTimeInSec + 1000);

      await expect(
        bilateralTrade(registerInstance, investorD, investorB, 5, today())
      ).to.be.rejectedWith(/the maturity cut-off time has passed/);
    });
  });
});
