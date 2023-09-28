import { ContractDeployTransaction } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployCouponContractFixture } from './deployer/coupon.deployer';
import { addPart, mineBlock } from './utils/dates';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import chaiAsPromised from 'chai-as-promised';
import chai, { expect } from 'chai';
import { ethers } from 'hardhat';

import { makeBondDate, makeDateTime } from './utils/dates';
import exp from 'constants';

chai.use(chaiAsPromised);

describe('Run tests of the Coupon process', function () {
  describe('Coupon process', function () {
    it('should pass the initialization and check the status', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      // The Bnd Balance should be equals to the expected full quantity
      // The total quantity in the register should be the expected quantity

      const totalSupply = Number.parseInt(
        await registerInstance.totalSupply(cakAccount)
      );
      const bndBalance = Number.parseInt(
        await registerInstance.connect(cakAccount).balanceOf(bnd)
      );
      const invABalance = Number.parseInt(
        await registerInstance.connect(cakAccount).balanceOf(investorA)
      );
      const data = await registerInstance.getBondData(cakAccount);
      const isPay = await registerInstance.connect(payer).isPay(payer.address);

      expect(totalSupply).to.equal(expectedSupply);
      expect(bndBalance + invABalance).to.equal(expectedSupply);
      expect(isPay).to.be.true;
    });

    it('should fail to deploy the coupon smart contract when the deployer has not the PAY role', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(wrongAccount);

      await expect(
        coupon.deploy(
          registerInstanceAddress,
          firstCouponDate,
          1500,
          firstCouponDate,
          300000
        )
      ).to.be.revertedWith('Sender must be a Paying calculation agent');
    });

    it('should fail to deploy the coupon smart contract when the Coupon Date does not exist', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const wrongCouponDate = addPart(firstCouponDate, 'D', 1);

      await expect(
        coupon.deploy(
          registerInstanceAddress,
          wrongCouponDate,
          1500,
          firstCouponDate,
          300000
        )
      ).to.be.revertedWith('this couponDate does not exists');
    });

    it('should deploy the coupon smart contract and check if Coupon Date exists', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      await coupon.deploy(
        registerInstanceAddress,
        firstCouponDate,
        1500,
        firstCouponDate,
        300000
      );
      const data = await registerInstance.getBondData();
      const couponDates = data.couponDates;
      const firstCouponDateBigInt = BigInt(firstCouponDate);

      expect(couponDates).to.contain(firstCouponDateBigInt);
    });

    it('should deploy the coupon and get paymentID for an investor (max 16 hexa chars excluding 0x)', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment = await coupon.deploy(
        registerInstanceAddress,
        firstCouponDate,
        1500,
        firstCouponDate,
        300000
      );
      const couponInstance = await couponDeployment.connect(payer);
      const paymentID = await couponInstance.paymentIdForInvest(
        investorA.address
      );

      expect(paymentID).to.be.properHex(16);
    });

    it('should deploy the coupon smart contract and initialize the status', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment = await coupon.deploy(
        registerInstanceAddress,
        firstCouponDate,
        1500,
        firstCouponDate,
        300000
      );
      const couponInstance = await couponDeployment.connect(payer);
      const status = await couponInstance.status();

      expect(status).to.equal(0); // Draft
    });

    it('should fail when the paying calculation agent activate a coupon with a too old record date', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const couponDate = firstCouponDate; // 17 dec 2022 00:00:00
      const recordDate = addPart(firstCouponDate, 'D', -11);
      const cutofftime = 55000; //15:16:40
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        1500,
        recordDate,
        cutofftime
      );
      const couponInstance = await couponDeployment.connect(payer);
      const couponInstanceAddress = couponInstance.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstanceAddress);
      await registerInstance.enableContractToWhitelist(hash);

      await expect(couponInstance.setDateAsCurrentCoupon()).to.be.revertedWith(
        'Inconsistent record date more than 10 days before settlement date'
      );
    });

    it('should enable the paying calculation agent to activate the coupon', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const couponDate = firstCouponDate; // 17 dec 2022 00:00:00
      const recordDate = addPart(firstCouponDate, 'D', -1);
      const cutofftime = 55000; //15:16:40
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        1500,
        recordDate,
        cutofftime
      );
      const couponInstance = await couponDeployment.connect(payer);
      const couponInstanceAddress = couponInstance.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstanceAddress);
      await registerInstance.enableContractToWhitelist(hash);

      await expect(couponInstance.setDateAsCurrentCoupon())
        .to.emit(couponInstance, 'CouponChanged')
        .withArgs(registerInstanceAddress, couponDate, 1);
    });

    it('should enable the paying calculation agent to set the number of days (nbDays)', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const couponDate = firstCouponDate; // 17 dec 2022 00:00:00
      const recordDate = addPart(firstCouponDate, 'D', -1);
      const cutofftime = 55000; //15:16:40
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        1500,
        recordDate,
        cutofftime
      );
      const couponInstance = await couponDeployment.connect(payer);
      const couponInstanceAddress = couponInstance.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstanceAddress);
      await registerInstance.enableContractToWhitelist(hash);

      await couponInstance.setNbDays(360);
      expect(await couponInstance.nbDays(payer.call())).to.equal('360');
    });

    it('should enable the paying calculation agent to validate the coupon by calling setDateAsCurrentCoupon so that coupon status is set to Ready', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const couponDate = firstCouponDate; // 17 dec 2022 00:00:00
      const recordDate = addPart(firstCouponDate, 'D', -1);
      const cutofftime = 55000; //15:16:40
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        1500,
        recordDate,
        cutofftime
      );
      const couponInstance = await couponDeployment.connect(payer);
      const couponInstanceAddress = couponInstance.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstanceAddress);
      await registerInstance.enableContractToWhitelist(hash);

      await expect(couponInstance.setDateAsCurrentCoupon())
        .to.emit(couponInstance, 'CouponChanged')
        .withArgs(registerInstanceAddress, couponDate, 1);
    });

    it('should calculate the payment amount for an investor', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const couponDate = firstCouponDate; // 17 dec 2022 00:00:00
      const recordDate = addPart(firstCouponDate, 'D', -1);
      const cutofftime = 55000; //15:16:40
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        1500,
        recordDate,
        cutofftime
      );
      const couponInstance = await couponDeployment.connect(payer);
      const couponInstanceAddress = couponInstance.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstanceAddress);
      await registerInstance.enableContractToWhitelist(hash);

      await couponInstance.setNbDays(360);
      expect(await couponInstance.nbDays()).to.equal('360');

      await couponInstance.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance.status(payer.call())).to.equal('1');

      let unitValue = Number.parseInt(
        await registerInstance.getBondUnitValue()
      );

      let couponRate = Number.parseInt(
        await registerInstance.getBondCouponRate()
      );

      let bal = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorA.address,
          firstCouponDate
        )
      );

      let payment = (unitValue * couponRate * bal * 360) / 360;

      expect(
        await couponInstance.getPaymentAmountForInvestor(investorA.address)
      ).to.equal(payment);
    });

    it('should calculate the payment amount for several investors ', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        investorB,
        investorC,
        investorD,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const couponDate = firstCouponDate; // 17 dec 2022 00:00:00
      const recordDate = addPart(firstCouponDate, 'D', -1);
      const cutofftime = 55000; //15:16:40
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        1500,
        recordDate,
        cutofftime
      );
      const couponInstance = await couponDeployment.connect(payer);
      const couponInstanceAddress = couponInstance.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstanceAddress);
      await registerInstance.enableContractToWhitelist(hash);

      await couponInstance.setNbDays(360);
      expect(await couponInstance.nbDays()).to.equal('360');

      await couponInstance.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance.status(payer.call())).to.equal('1');

      let unitValue = Number.parseInt(
        await registerInstance.getBondUnitValue()
      );

      let couponRate = Number.parseInt(
        await registerInstance.getBondCouponRate()
      );

      let balanceInvestorA = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorA.address,
          firstCouponDate
        )
      );

      let balanceInvestorB = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorB.address,
          firstCouponDate
        )
      );

      let balanceInvestorC = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorC.address,
          firstCouponDate
        )
      );

      let balanceInvestorD = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorD.address,
          firstCouponDate
        )
      );

      let paymentInvestorA = Math.floor(
        (unitValue * couponRate * balanceInvestorA * 360) / 360
      );
      let paymentInvestorB = Math.floor(
        (unitValue * couponRate * balanceInvestorB * 360) / 360
      );
      let paymentInvestorC = Math.floor(
        (unitValue * couponRate * balanceInvestorC * 360) / 360
      );
      let paymentInvestorD = Math.floor(
        (unitValue * couponRate * balanceInvestorD * 360) / 360
      );

      expect(
        await couponInstance.getPaymentAmountForInvestor(investorA.address)
      ).to.equal(paymentInvestorA);

      expect(
        await couponInstance.getPaymentAmountForInvestor(investorB.address)
      ).to.equal(paymentInvestorB);

      expect(
        await couponInstance.getPaymentAmountForInvestor(investorC.address)
      ).to.equal(paymentInvestorC);

      expect(
        await couponInstance.getPaymentAmountForInvestor(investorD.address)
      ).to.equal(paymentInvestorD);
    });

    it('should not allow creating a coupon smart contract after the cutoff time', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      const couponDate = firstCouponDate; // 17 dec 2022 00:00:00
      const recordDate = addPart(firstCouponDate, 'D', -1);
      const cutofftime = 55000; //15:16:40
      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);

      const couponDeployment = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        1500,
        recordDate,
        cutofftime
      );
      const couponInstance = await couponDeployment.connect(payer);
      const couponInstanceAddress = couponInstance.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstanceAddress);
      await registerInstance.enableContractToWhitelist(hash);

      time.increaseTo(couponDate + cutofftime + 1000);

      await expect(couponInstance.setDateAsCurrentCoupon()).to.be.revertedWith(
        'you have to define a new period ending after the current time'
      );
    });

    it('should deploy a second coupon and take snapshot of evolving balances', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        investorB,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      let couponDate = firstCouponDate;
      let recordDate = addPart(couponDate, 'D', -1);
      let nbDays = 100;
      let cutofftime = 17 * 3600;

      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment1 = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        nbDays,
        recordDate,
        cutofftime
      );
      const couponInstance1 = await couponDeployment1.connect(payer);
      const couponInstance1Address = couponInstance1.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstance1Address);
      await registerInstance.enableContractToWhitelist(hash);

      nbDays = 180;
      await couponInstance1.setNbDays(nbDays);
      expect(await couponInstance1.nbDays()).to.equal(`${nbDays}`);

      await couponInstance1.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance1.status(payer.call())).to.equal('1');

      let unitValue = Number.parseInt(
        await registerInstance.getBondUnitValue()
      );

      let couponRate = Number.parseInt(
        await registerInstance.getBondCouponRate()
      );

      let balanceInvestorA = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorA.address,
          firstCouponDate
        )
      );

      let balanceInvestorB = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorB.address,
          firstCouponDate
        )
      );

      let paymentInvestorA = Math.floor(
        (unitValue * couponRate * balanceInvestorA * nbDays) / 360
      );

      let paymentInvestorB = Math.floor(
        (unitValue * couponRate * balanceInvestorB * nbDays) / 360
      );

      let couponPaymentForInvestorA =
        await couponInstance1.getPaymentAmountForInvestor(investorA.address);

      let couponPaymentForInvestorB =
        await couponInstance1.getPaymentAmountForInvestor(investorB.address);

      expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);

      expect(couponPaymentForInvestorB).to.equal(paymentInvestorB);

      //------------------------------------------------------------------------------------------------------------------
      // Time machine advance
      await time.increaseTo(addPart(firstCouponDate, 'D', -1) + cutofftime + 5); // Move beyond the coupon date + cutOff Time

      //Given a second coupon is deployed
      couponDate = firstCouponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, 'D', -1);

      const couponDeployment2 = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        nbDays,
        recordDate,
        cutofftime
      );
      const couponInstance2 = await couponDeployment2.connect(payer);
      const couponInstance2Address = couponInstance2.getAddress();

      let balAbefore = await registerInstance.balanceOf(investorA.address);
      let balBbefore = await registerInstance.balanceOf(investorB.address);

      await registerInstance.transferFrom(
        investorA.address,
        investorB.address,
        12
      );

      nbDays = 180;
      await couponInstance2.setNbDays(nbDays);
      expect(await couponInstance2.nbDays()).to.equal(`${nbDays}`);

      await couponInstance2.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance2.status(payer.call())).to.equal('1');

      //We calculate the payment amount for the second coupon for investorA
      balanceInvestorA = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorA.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorA = Math.floor(
        (unitValue * couponRate * balanceInvestorA * nbDays) / 360
      );

      couponPaymentForInvestorA =
        await couponInstance2.getPaymentAmountForInvestor(investorA.address);

      expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);

      //We calculate the payment amount for the second coupon for investorB
      balanceInvestorB = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorB.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorB = Math.floor(
        (unitValue * couponRate * balanceInvestorB * nbDays) / 360
      );

      couponPaymentForInvestorB =
        await couponInstance2.getPaymentAmountForInvestor(investorB.address);

      expect(couponPaymentForInvestorB).to.equal(paymentInvestorB);

      expect(await registerInstance.currentSnapshotDatetime()).to.equal(
        `${makeDateTime(recordDate, cutofftime)}`
      );
    });

    it('should deploy a third coupon, take snapshot of evolving balances for 3 investors', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        investorB,
        investorC,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      let couponDate = firstCouponDate;
      let recordDate = addPart(couponDate, 'D', -1);
      let nbDays = 100;
      let cutofftime = 17 * 3600;

      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment1 = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        nbDays,
        recordDate,
        cutofftime
      );
      const couponInstance1 = await couponDeployment1.connect(payer);
      const couponInstance1Address = couponInstance1.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstance1Address);
      await registerInstance.enableContractToWhitelist(hash);

      nbDays = 180;
      await couponInstance1.setNbDays(nbDays);
      expect(await couponInstance1.nbDays()).to.equal(`${nbDays}`);

      await couponInstance1.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance1.status(payer.call())).to.equal('1');

      let unitValue = Number.parseInt(
        await registerInstance.getBondUnitValue()
      );

      let couponRate = Number.parseInt(
        await registerInstance.getBondCouponRate()
      );

      let balanceInvestorA = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorA.address,
          firstCouponDate
        )
      );

      let balanceInvestorB = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorB.address,
          firstCouponDate
        )
      );

      let balanceInvestorC = Number.parseInt(
        await registerInstance.balanceOfCoupon(
          investorC.address,
          firstCouponDate
        )
      );

      let paymentInvestorA = Math.floor(
        (unitValue * couponRate * balanceInvestorA * nbDays) / 360
      );

      let paymentInvestorB = Math.floor(
        (unitValue * couponRate * balanceInvestorB * nbDays) / 360
      );

      let paymentInvestorC = Math.floor(
        (unitValue * couponRate * balanceInvestorC * nbDays) / 360
      );

      let couponPaymentForInvestorA =
        await couponInstance1.getPaymentAmountForInvestor(investorA.address);

      let couponPaymentForInvestorB =
        await couponInstance1.getPaymentAmountForInvestor(investorB.address);

      let couponPaymentForInvestorC =
        await couponInstance1.getPaymentAmountForInvestor(investorC.address);

      expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);

      expect(couponPaymentForInvestorB).to.equal(paymentInvestorB);

      expect(couponPaymentForInvestorC).to.equal(paymentInvestorC);

      let balancesBeforeSnapshot = [
        await registerInstance.balanceOf(investorA.address),
        await registerInstance.balanceOf(investorB.address),
        await registerInstance.balanceOf(investorC.address)
      ];

      let balancesOfCoupon1Before = [
        await registerInstance.balanceOfCoupon(
          investorA.address,
          firstCouponDate
        ),
        await registerInstance.balanceOfCoupon(
          investorB.address,
          firstCouponDate
        ),
        await registerInstance.balanceOfCoupon(
          investorC.address,
          firstCouponDate
        )
      ];

      expect(balancesBeforeSnapshot).to.deep.equal(balancesOfCoupon1Before);

      //------------------------------------------------------------------------------------------------------------------
      // Time machine advance
      await time.increaseTo(addPart(firstCouponDate, 'D', -1) + cutofftime + 5); // Move beyond the coupon date + cutOff Time

      //Given a second coupon is deployed
      couponDate = firstCouponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, 'D', -1);

      const couponDeployment2 = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        nbDays,
        recordDate,
        cutofftime
      );
      const couponInstance2 = await couponDeployment2.connect(payer);
      const couponInstance2Address = couponInstance2.getAddress();

      await registerInstance.transferFrom(
        investorA.address,
        investorB.address,
        12
      );

      await registerInstance.transferFrom(
        investorB.address,
        investorC.address,
        10
      );

      let balancesOfCoupon1After = [
        await registerInstance.balanceOfCoupon(
          investorA.address,
          firstCouponDate
        ),
        await registerInstance.balanceOfCoupon(
          investorB.address,
          firstCouponDate
        ),
        await registerInstance.balanceOfCoupon(
          investorC.address,
          firstCouponDate
        )
      ];

      let balancesOfCoupon2Before = [
        await registerInstance.balanceOfCoupon(investorA.address, couponDate),
        await registerInstance.balanceOfCoupon(investorB.address, couponDate),
        await registerInstance.balanceOfCoupon(investorC.address, couponDate)
      ];

      let balancesAfterSnapshot = [
        await registerInstance.balanceOf(investorA.address),
        await registerInstance.balanceOf(investorB.address),
        await registerInstance.balanceOf(investorC.address)
      ];

      expect(balancesOfCoupon1Before[0]).to.be.equal(balancesOfCoupon1After[0]);
      expect(balancesOfCoupon1Before[1]).to.be.equal(balancesOfCoupon1After[1]);
      expect(balancesOfCoupon1Before[2]).to.be.equal(balancesOfCoupon1After[2]);

      expect(balancesOfCoupon2Before[0]).to.be.equal(balancesAfterSnapshot[0]);
      expect(balancesOfCoupon2Before[1]).to.be.equal(balancesAfterSnapshot[1]);
      expect(balancesOfCoupon2Before[2]).to.be.equal(balancesAfterSnapshot[2]);

      nbDays = 180;
      await couponInstance2.setNbDays(nbDays);
      expect(await couponInstance2.nbDays()).to.equal(`${nbDays}`);

      await couponInstance2.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance2.status(payer.call())).to.equal('1');

      //We calculate the payment amount for the second coupon for investorA
      balanceInvestorA = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorA.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorA = Math.floor(
        (unitValue * couponRate * balanceInvestorA * nbDays) / 360
      );

      couponPaymentForInvestorA =
        await couponInstance2.getPaymentAmountForInvestor(investorA.address);

      expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);

      //We calculate the payment amount for the second coupon for investorB
      balanceInvestorB = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorB.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorB = Math.floor(
        (unitValue * couponRate * balanceInvestorB * nbDays) / 360
      );

      couponPaymentForInvestorB =
        await couponInstance2.getPaymentAmountForInvestor(investorB.address);

      expect(couponPaymentForInvestorB).to.equal(paymentInvestorB);

      //We calculate the payment amount for the second coupon for investorC
      balanceInvestorC = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorC.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorC = Math.floor(
        (unitValue * couponRate * balanceInvestorC * nbDays) / 360
      );

      couponPaymentForInvestorC =
        await couponInstance2.getPaymentAmountForInvestor(investorC.address);

      expect(couponPaymentForInvestorC).to.equal(paymentInvestorC);

      await time.increaseTo(recordDate + cutofftime + 3600); // Move beyond the coupon date + cutOff Time

      //------------------------------------------------------------------------------------------------------------------

      //Given a second coupon is deployed
      couponDate = couponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, 'D', -1);

      const couponDeployment3 = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        nbDays,
        recordDate,
        cutofftime
      );
      const couponInstance3 = await couponDeployment3.connect(payer);
      const couponInstance3Address = couponInstance3.getAddress();

      //do a transfer 1 so the balance moves
      await registerInstance.transferFrom(
        investorA.address,
        investorB.address,
        23
      );

      await registerInstance.transferFrom(
        investorB.address,
        investorC.address,
        18
      );

      //do a transfer 2 so the balance moves
      await registerInstance.transferFrom(
        investorA.address,
        investorB.address,
        2
      );
      await registerInstance.transferFrom(
        investorB.address,
        investorC.address,
        3
      );
      await registerInstance.transferFrom(
        investorC.address,
        investorA.address,
        6
      );

      nbDays = 180;
      await couponInstance3.setNbDays(nbDays);
      expect(await couponInstance3.nbDays()).to.equal(`${nbDays}`);

      await couponInstance3.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance3.status(payer.call())).to.equal('1');

      //We calculate the payment amount for the second coupon for investorA
      balanceInvestorA = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorA.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorA = Math.floor(
        (unitValue * couponRate * balanceInvestorA * nbDays) / 360
      );

      couponPaymentForInvestorA =
        await couponInstance3.getPaymentAmountForInvestor(investorA.address);

      expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);

      //We calculate the payment amount for the second coupon for investorB
      balanceInvestorB = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorB.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorB = Math.floor(
        (unitValue * couponRate * balanceInvestorB * nbDays) / 360
      );

      couponPaymentForInvestorB =
        await couponInstance3.getPaymentAmountForInvestor(investorB.address);

      expect(couponPaymentForInvestorB).to.equal(paymentInvestorB);

      //We calculate the payment amount for the second coupon for investorC
      balanceInvestorC = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorC.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorC = Math.floor(
        (unitValue * couponRate * balanceInvestorC * nbDays) / 360
      );

      couponPaymentForInvestorC =
        await couponInstance3.getPaymentAmountForInvestor(investorC.address);

      expect(couponPaymentForInvestorC).to.equal(paymentInvestorC);

      expect(await registerInstance.currentSnapshotDatetime()).to.equal(
        `${makeDateTime(recordDate, cutofftime)}`
      );
    });

    it('should deploy a third coupon, take snapshot of evolving balances for 3 investors make payment Ready, close coupon and finalize it', async () => {
      const {
        registerInstance,
        payer,
        registerInstanceAddress,
        cakAccount,
        investorA,
        investorB,
        investorC,
        investorD,
        bnd,
        wrongAccount,
        firstCouponDate,
        expectedSupply
      } = await loadFixture(deployCouponContractFixture);
      let couponDate = firstCouponDate;
      let recordDate = addPart(couponDate, 'D', -1);

      let nbDays = 100;
      let cutofftime = 17 * 3600;

      const Coupon = await ethers.getContractFactory('Coupon');
      const coupon = await Coupon.connect(payer);
      const couponDeployment4 = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        nbDays,
        recordDate,
        cutofftime
      );
      const couponInstance4 = await couponDeployment4.connect(payer);
      const couponInstance4Address = couponInstance4.getAddress();

      //whitelist coupon contract into register
      let hash = await registerInstance.atReturningHash(couponInstance4Address);
      await registerInstance.enableContractToWhitelist(hash);

      await couponInstance4.setNbDays(nbDays);
      expect(await couponInstance4.nbDays()).to.equal(`${nbDays}`);

      await couponInstance4.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance4.status(payer.call())).to.equal('1');

      //We calculate the payment amount for the second coupon for investorA
      let balanceInvestorA = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorA.address, couponDate)
      );

      let unitValue = Number.parseInt(
        await registerInstance.getBondUnitValue()
      );

      let couponRate = Number.parseInt(
        await registerInstance.getBondCouponRate()
      );

      let paymentInvestorA = Math.floor(
        (unitValue * couponRate * balanceInvestorA * nbDays) / 360
      );

      let couponPaymentForInvestorA =
        await couponInstance4.getPaymentAmountForInvestor(investorA.address);

      // expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);
      expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);

      //We calculate the payment amount for the second coupon for investorB
      let balanceInvestorB = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorB.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      let paymentInvestorB = Math.floor(
        (unitValue * couponRate * balanceInvestorB * nbDays) / 360
      );

      let couponPaymentForInvestorB =
        await couponInstance4.getPaymentAmountForInvestor(investorB.address);

      expect(couponPaymentForInvestorB).to.equal(paymentInvestorB);

      //We calculate the payment amount for the second coupon for investorC
      let balanceInvestorC = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorC.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      let paymentInvestorC = Math.floor(
        (unitValue * couponRate * balanceInvestorC * nbDays) / 360
      );

      let couponPaymentForInvestorC =
        await couponInstance4.getPaymentAmountForInvestor(investorC.address);

      expect(couponPaymentForInvestorC).to.equal(paymentInvestorC);

      await time.increaseTo(recordDate + cutofftime + 1); // Move beyond the coupon date + cutOff Time

      await couponDeployment4
        .connect(cakAccount)
        .toggleCouponPayment(investorA.address);

      await couponDeployment4
        .connect(cakAccount)
        .toggleCouponPayment(investorB.address);

      await couponDeployment4
        .connect(cakAccount)
        .toggleCouponPayment(investorC.address);

      await couponDeployment4
        .connect(cakAccount)
        .toggleCouponPayment(investorD.address);

      await time.increaseTo(recordDate + cutofftime + 3600); // Move beyond the coupon date + cutOff Time

      couponDate = couponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, 'D', -1);

      const couponDeployment5 = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        nbDays,
        recordDate,
        cutofftime
      );
      const couponInstance5 = await couponDeployment5.connect(payer);
      const couponInstance5Address = couponInstance5.getAddress();

      await registerInstance.transferFrom(
        investorA.address,
        investorB.address,
        12
      );
      await registerInstance.transferFrom(
        investorB.address,
        investorC.address,
        10
      );

      await registerInstance.transferFrom(
        investorA.address,
        investorB.address,
        12
      );

      await registerInstance.transferFrom(
        investorB.address,
        investorC.address,
        10
      );

      await registerInstance.transferFrom(
        investorC.address,
        investorA.address,
        7
      );

      await couponInstance5.setNbDays(nbDays);
      expect(await couponInstance5.nbDays()).to.equal(`${nbDays}`);

      await couponInstance5.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance5.status(payer.call())).to.equal('1');

      //We calculate the payment amount for the second coupon for investorA
      balanceInvestorA = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorA.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());

      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorA = Math.floor(
        (unitValue * couponRate * balanceInvestorA * nbDays) / 360
      );

      couponPaymentForInvestorA =
        await couponInstance5.getPaymentAmountForInvestor(investorA.address);

      // expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);
      expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);

      //We calculate the payment amount for the second coupon for investorB
      balanceInvestorB = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorB.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorB = Math.floor(
        (unitValue * couponRate * balanceInvestorB * nbDays) / 360
      );

      couponPaymentForInvestorB =
        await couponInstance5.getPaymentAmountForInvestor(investorB.address);

      expect(couponPaymentForInvestorB).to.equal(paymentInvestorB);

      //We calculate the payment amount for the second coupon for investorC
      balanceInvestorC = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorC.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorC = Math.floor(
        (unitValue * couponRate * balanceInvestorC * nbDays) / 360
      );

      couponPaymentForInvestorC =
        await couponInstance5.getPaymentAmountForInvestor(investorC.address);

      expect(couponPaymentForInvestorC).to.equal(paymentInvestorC);

      await time.increaseTo(recordDate + cutofftime + 1); // Move beyond the coupon date + cutOff Time

      await couponDeployment5
        .connect(cakAccount)
        .toggleCouponPayment(investorA.address);

      await couponDeployment5
        .connect(cakAccount)
        .toggleCouponPayment(investorB.address);

      await couponDeployment5
        .connect(cakAccount)
        .toggleCouponPayment(investorC.address);

      await couponDeployment5
        .connect(cakAccount)
        .toggleCouponPayment(investorD.address);

      await time.increaseTo(recordDate + cutofftime + 3600); // Move beyond the coupon date + cutOff Time

      couponDate = couponDate + 2 * 24 * 3600;
      recordDate = addPart(couponDate, 'D', -1);

      const couponDeployment6 = await coupon.deploy(
        registerInstanceAddress,
        couponDate,
        nbDays,
        recordDate,
        cutofftime
      );
      const couponInstance6 = await couponDeployment6.connect(payer);
      const couponInstance6Address = couponInstance6.getAddress();

      await registerInstance.transferFrom(
        investorA.address,
        investorB.address,
        12
      );
      await registerInstance.transferFrom(
        investorB.address,
        investorC.address,
        10
      );

      await registerInstance.transferFrom(
        investorA.address,
        investorB.address,
        12
      );

      await registerInstance.transferFrom(
        investorB.address,
        investorC.address,
        10
      );

      await registerInstance.transferFrom(
        investorC.address,
        investorA.address,
        7
      );

      await couponInstance6.setNbDays(nbDays);
      expect(await couponInstance6.nbDays()).to.equal(`${nbDays}`);

      await couponInstance6.setDateAsCurrentCoupon(); //implicit coupon validation
      expect(await couponInstance6.status(payer.call())).to.equal('1');

      //We calculate the payment amount for the second coupon for investorA
      balanceInvestorA = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorA.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());

      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorA = Math.floor(
        (unitValue * couponRate * balanceInvestorA * nbDays) / 360
      );

      couponPaymentForInvestorA =
        await couponInstance6.getPaymentAmountForInvestor(investorA.address);

      // expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);
      expect(couponPaymentForInvestorA).to.equal(paymentInvestorA);

      //We calculate the payment amount for the second coupon for investorB
      balanceInvestorB = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorB.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorB = Math.floor(
        (unitValue * couponRate * balanceInvestorB * nbDays) / 360
      );

      couponPaymentForInvestorB =
        await couponInstance6.getPaymentAmountForInvestor(investorB.address);

      expect(couponPaymentForInvestorB).to.equal(paymentInvestorB);

      //We calculate the payment amount for the second coupon for investorC
      balanceInvestorC = Number.parseInt(
        await registerInstance.balanceOfCoupon(investorC.address, couponDate)
      );

      unitValue = Number.parseInt(await registerInstance.getBondUnitValue());
      couponRate = Number.parseInt(await registerInstance.getBondCouponRate());

      paymentInvestorC = Math.floor(
        (unitValue * couponRate * balanceInvestorC * nbDays) / 360
      );

      couponPaymentForInvestorC =
        await couponInstance6.getPaymentAmountForInvestor(investorC.address);

      expect(couponPaymentForInvestorC).to.equal(paymentInvestorC);

      await time.increaseTo(recordDate + cutofftime + 1); // Move beyond the coupon date + cutOff Time

      await couponDeployment6
        .connect(cakAccount)
        .toggleCouponPayment(investorA.address);

      await couponDeployment6
        .connect(cakAccount)
        .toggleCouponPayment(investorB.address);

      await couponDeployment6
        .connect(cakAccount)
        .toggleCouponPayment(investorC.address);

      await couponDeployment6
        .connect(cakAccount)
        .toggleCouponPayment(investorD.address);
    });
  });
});
