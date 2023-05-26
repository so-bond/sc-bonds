import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import Web3 from "web3";
import Ganache from "ganache";
import { blockTimestamp, future, initWeb3Time, mineBlock } from "./dates";
import { blockGasLimit } from "./gas.constant";


describe('Verify the evm_mine evm_increaseTime', function() {
  this.timeout(10000);
  let web3: Web3;
  let mine: (newTimestampSec: number) => Promise<any>;

  async function init(): Promise<void> {
    web3 = new Web3(Ganache.provider({ default_balance_ether: 1000, gasLimit: blockGasLimit, chain: {vmErrorsOnRPCResponse:true} }) as any);

    initWeb3Time(web3)

  }

  before(async () => {
    await init();
  });

  it('check mining is progressing and timestamp as well', async () => {
    const blockNumber = await web3.eth.getBlockNumber();
    // const block = await web3.eth.getBlock(blockNumber)
    const timestamp = await blockTimestamp();
    console.log("block", blockNumber, new Date(timestamp*1000).toISOString());
    const span = 3600;
    
    await mineBlock(timestamp+span);
    
    const blockNumber2 = await web3.eth.getBlockNumber();
    // const block2 = await web3.eth.getBlock(blockNumber2)
    const timestamp2 = await blockTimestamp();
    console.log("block", blockNumber2, new Date(timestamp2*1000).toISOString());

    expect(timestamp2).equal(timestamp+span)
  });
});