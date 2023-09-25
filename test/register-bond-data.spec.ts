import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployRegisterContractBondDataFixture } from './deployer/register.deployer';
import { addPart, makeBondDate, mineBlock } from './utils/dates';
import { ethers } from 'hardhat';

chai.use(chaiAsPromised);

describe('Register (Bond Issuance) metadata', function () {
  let fixture: any;
  this.beforeEach(async () => {
    fixture = await loadFixture(deployRegisterContractBondDataFixture);
  });

  this.afterEach(async () => {
    fixture = null;
  });

  it('setBondData without the coupons', async () => {
    const { web3, instance, cakAccount } = fixture;
    const bondName = 'EIB 3Y 1Bn SEK';
    const symbol = 'SEK';
    const expectedSupply = 1000;
    const currency = web3.utils.soliditySha3('SEK');
    const unitVal = 100000;
    const couponRate = 0.5 * 100 * 10000;
    let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);
    const issuanceDate = initialBondDates.issuanceDate - 1;
    const maturityDate = initialBondDates.maturityDate + 24 * 3600;
    // const couponDates = [1309302208, 1309402208]; //UTC
    const cutOffTime = initialBondDates.defaultCutofftime + 3600;

    //ACT
    await instance
      .connect(cakAccount)
      .setBondData(
        bondName,
        expectedSupply,
        currency,
        unitVal,
        couponRate,
        issuanceDate,
        maturityDate,
        cutOffTime
      );

    //ASSERT
    const bondData = await instance.connect(cakAccount).getBondData();

    expect(bondData.name).equal(bondName);
    expect(bondData.currency).equal(currency);
    expect(bondData.expectedSupply).equal(`${expectedSupply}`);
    expect(bondData.unitValue).equal(`${unitVal}`);
    expect(bondData.couponRate).equal(`${couponRate}`);
    expect(bondData.issuanceDate).equal(`${issuanceDate}`);
    expect(bondData.maturityDate).equal(`${maturityDate}`);
    expect(bondData.cutOffTime).equal(`${cutOffTime}`);
  });

  describe('Test the setting of the coupons before time started', () => {
    it('should add a coupon in the middle', async () => {
      const { web3, instance, cakAccount } = fixture;
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);

      // ACT
      const newDate = initialBondDates.couponDates[0] + 5 * 24 * 3600; // + 5 days
      await instance.connect(cakAccount).addCouponDate(newDate);

      const bondData = await instance.connect(cakAccount).getBondData();

      //ASSERT
      let expectedCoupons: any[] = [...initialBondDates.couponDates];
      expectedCoupons.push(newDate);
      expectedCoupons = expectedCoupons.sort().map((c) => `${c}`);

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal(
        [...bondData.couponDates].sort()
      );
      expect(bondData.couponDates.length).equal(
        initialBondDates.couponDates.length + 1
      );
      expect(bondData.couponDates[1]).equal(`${newDate}`);
      expect(bondData.couponDates).deep.equal(expectedCoupons);
    });

    it('should add a coupon date in the first place', async () => {
      const { web3, instance, cakAccount } = fixture;
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);

      // ACT
      const newDate = initialBondDates.couponDates[0] - 5 * 24 * 3600; // - 5 days

      await instance.connect(cakAccount).addCouponDate(newDate);
      //ASSERT
      const bondData = await instance.connect(cakAccount).getBondData();

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal(
        [...bondData.couponDates].sort()
      );
      expect(bondData.couponDates.length).equal(
        initialBondDates.couponDates.length + 1
      );
      expect(bondData.couponDates[0]).equal(`${newDate}`);
    });

    it('should add a coupon date in the last place', async () => {
      const { web3, instance, cakAccount } = fixture;
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);

      // ACT
      const newDate =
        initialBondDates.couponDates[initialBondDates.couponDates.length - 1] +
        5 * 24 * 3600; // - 5 days

      await instance.connect(cakAccount).addCouponDate(newDate);

      //ASSERT
      const bondData = await instance.connect(cakAccount).getBondData();

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal(
        [...bondData.couponDates].sort()
      );
      expect(bondData.couponDates.length).equal(
        initialBondDates.couponDates.length + 1
      );
      expect(bondData.couponDates[bondData.couponDates.length - 1]).equal(
        `${newDate}`
      );
    });

    it('should fail adding a coupon date after or on the maturity', async () => {
      const { web3, instance, cakAccount } = fixture;
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);
      // ACT
      const newDate = initialBondDates.maturityDate; //
      const p = instance.connect(cakAccount).addCouponDate(newDate);
      //ASSERT
      await expect(p).to.be.rejectedWith(
        /Cannot set a coupon date greater or equal to the maturity date/
      );
    });

    it('should fail adding a coupon date before or on the issuance date', async () => {
      const { web3, instance, cakAccount } = fixture;
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);
      // ACT
      const newDate = initialBondDates.issuanceDate; //
      const p = instance.connect(cakAccount).addCouponDate(newDate);
      //ASSERT
      await expect(p).to.be.rejectedWith(
        /Cannot set a coupon date smaller or equal to the issuance date/
      );
    });

    it('should remove a coupon date in the last place', async () => {
      const { web3, instance, cakAccount } = fixture;
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);

      // ACT
      const toRemove =
        initialBondDates.couponDates[initialBondDates.couponDates.length - 1];

      await instance.connect(cakAccount).delCouponDate(toRemove);

      //ASSERT
      const expectedCoupons = initialBondDates.couponDates.map((c) => `${c}`);
      expectedCoupons.pop();
      const bondData = await instance.connect(cakAccount).getBondData();

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal(
        [...bondData.couponDates].sort()
      );
      expect(bondData.couponDates.length).equal(
        initialBondDates.couponDates.length - 1
      );
      expect(bondData.couponDates).deep.equal(expectedCoupons);
    });

    it('should remove a coupon date in the first place', async () => {
      const { web3, instance, cakAccount } = fixture;
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);
      // ACT
      const toRemove = initialBondDates.couponDates[0];

      await instance.connect(cakAccount).delCouponDate(toRemove);

      //ASSERT
      const expectedCoupons = initialBondDates.couponDates.map((c) => `${c}`);
      expectedCoupons.shift();
      const bondData = await instance.connect(cakAccount).getBondData();

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal(
        [...bondData.couponDates].sort()
      );
      expect(bondData.couponDates.length).equal(
        initialBondDates.couponDates.length - 1
      );
      expect(bondData.couponDates).deep.equal(expectedCoupons);
    });

    it('should remove a coupon date in the middle', async () => {
      const { web3, instance, cakAccount } = fixture;
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);
      // ACT
      const toRemove = initialBondDates.couponDates[1];

      await instance.connect(cakAccount).delCouponDate(toRemove);
      //ASSERT
      let expectedCoupons = initialBondDates.couponDates.map((c) => `${c}`);
      expectedCoupons = expectedCoupons.filter((c, i) => i !== 1);
      const bondData = await instance.connect(cakAccount).getBondData();

      // ensure sorted
      expect(bondData.couponDates).to.deep.equal(
        [...bondData.couponDates].sort()
      );
      expect(bondData.couponDates.length).equal(
        initialBondDates.couponDates.length - 1
      );
      expect(bondData.couponDates).deep.equal(expectedCoupons);
    });
  });

  describe('Test the setting of the coupons when the time passes', () => {
    let payAccount: any;

    beforeEach(async () => {
      const { instance, strangerAccount, web3, strangerAddress, cakAccount } =
        fixture;

      payAccount = strangerAccount;
      await instance.connect(cakAccount).grantPayRole(payAccount);
    });

    async function passCoupon(_fixture: any, datetime: number) {
      const { instanceAddress, web3, instance, cakAccount } = _fixture;
      let hash = '';
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);
      for (const couponDate of initialBondDates.couponDates) {
        const recordDate = addPart(couponDate, 'D', -1);

        if (couponDate <= datetime) {
          await mineBlock(recordDate - 1);
          const Coupon = await ethers.getContractFactory('Coupon');
          let coupon = await Coupon.deploy(
            instanceAddress,
            couponDate,
            360,
            recordDate,
            initialBondDates.defaultCutofftime
          );
          const couponAddress = await coupon.getAddress();
          if (hash == '') {
            hash = await instance.atReturningHash(couponAddress);
            await instance.connect(cakAccount).enableContractToWhitelist(hash);
          }
          await coupon.connect(payAccount).setDateAsCurrentCoupon();
          const timestamp = await instance
            .connect(payAccount)
            .currentSnapshotDatetime();
        }
      }

      await mineBlock(datetime);
    }

    it('should update the next timestamp if adding a coupon before the next one but after the current one', async () => {
      const { instance, cakAccount } = fixture;

      // Given the first coupon has been created but time is before the timestamp
      // const dataB4 = await instance.getBondData(cak.call());
      let initialBondDates = makeBondDate(3, 12 * 30 * 24 * 3600);
      await passCoupon(fixture, initialBondDates.couponDates[0] - 1000);
      const newDate = initialBondDates.couponDates[0] + 5 * 24 * 3600; // 5 days
      // When a coupon is added just after the current one
      await instance.connect(cakAccount).addCouponDate(newDate);
      // Then the current coupon date should not change, the current timestamp either and the next one should
      // const data = await instance.getBondData();

      const currentCouponDate = await instance
        .connect(payAccount)
        .currentCouponDate();

      const currentSnapshotDatetime = await instance
        .connect(payAccount)
        .currentSnapshotDatetime();

      const nextSnapshotDatetime = await instance
        .connect(payAccount)
        .nextSnapshotDatetime();

      expect(currentCouponDate).to.equal(initialBondDates.couponDates[0]);
      expect(currentSnapshotDatetime).to.equal(
        initialBondDates.couponDates[0] + initialBondDates.defaultCutofftime
      );
      expect(nextSnapshotDatetime).to.equal(
        newDate + (parseInt(currentSnapshotDatetime) % (24 * 3600))
      );
    });

    it('should update the current timestamp if adding a coupon before the current', async () => {});

    it('should update the next timestamp if deleting the coupon following the current one', async () => {});
    it('should update the current timestamp to the maturity when deleting all coupons', async () => {});

    it('should fail deleting a passed coupon ', async () => {});

    it('should fail adding a coupon before the current one', async () => {});
  });

  it('setBondData should be denied if called is not CAK', async () => {
    const { web3, instance, strangerAccount } = fixture;
    const bondName = 'EIB 3Y 1Bn SEK';
    const isin = web3.utils.asciiToHex('Code Isin');
    const expectedSupply = 1000;
    const currency = web3.utils.soliditySha3('SEK');

    const unitVal = 100000;
    const couponRate = web3.utils.asciiToHex('0.4');
    const issuanceDate = 1309102208; //UTC
    const maturityDate = 1309202208; //UTC
    // const couponDates = [1309302208, 1309402208]; //UTC
    const defaultCutofftime = 17 * 3600; //17:00

    //ACT
    await expect(
      instance
        .connect(strangerAccount)
        .setBondData(
          bondName,
          expectedSupply,
          currency,
          unitVal,
          couponRate,
          issuanceDate,
          maturityDate,
          defaultCutofftime
        )
    ).to.be.rejectedWith('Caller must be CAK');
  });
});
