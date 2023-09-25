import { time } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import chai, { expect } from 'chai';

describe('Verify the evm_mine evm_increaseTime', function () {
  it('check mining is progressing and timestamp as well', async () => {
    const timestamp = await time.latest();
    const span = 3600;
    await time.increase(span);
    const timestamp2 = await time.latest();
    expect(timestamp2).to.be.gt(timestamp);
    expect(timestamp2).to.be.equal(timestamp + span);
  });
});
