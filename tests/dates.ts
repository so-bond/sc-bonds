/** Module for test of solidity smart contract that simplifies the initialization
 * 
 * hanldes dates in seconds
 */

import Web3 from "web3";
import Web3Utils from "web3-utils";

const _num = (v:number|string) => typeof v == "string"? Number.parseInt(v) : v;
const toSec = (asMs:number) => Math.floor(_num(asMs) / 1000);
const timePart = (asMs:number) => toSec(_num(asMs) % (24*3600*1000));
const datePart = (asMs:number) => toSec(_num(asMs)) - timePart(asMs);

export function today(): number {
  return datePart(Date.now())
}

export function time(): number {
  return timePart(Date.now())
}

export function makeDateTime(dateSec: number, timeSec: number): number {
  return datePart(dateSec*1000) + timePart(timeSec*1000);
}

export function addPart(asSec:number, part:"Y"|"M"|"D"|"H"|"m"|"s", v:number): number {
  let dt = new Date(asSec * 1000)
  let ms = Date.UTC(
    dt.getUTCFullYear() + (part=="Y"?v:0),
    dt.getUTCMonth() + (part=="M"?v:0),
    dt.getUTCDate() + (part=="D"?v:0),
    dt.getUTCHours() + (part=="H"?v:0),
    dt.getUTCMinutes() + (part=="m"?v:0),
    dt.getUTCSeconds() + (part=="s"?v:0),
    dt.getUTCMilliseconds()
  )
  return toSec(ms);
}

export function future(moveToSec: number) : number {
  return addPart(toSec(Date.now()), "s", moveToSec);
}

export function makeBondDate(nbCoupons: number = 3, couponSpaceSec:number = 30*24*3600 ) {
  const start = today();
  const coupons: number[] = [];
  let last = start;
  for(let i=0; i<nbCoupons; i++) {
    last = last + couponSpaceSec;
    coupons.push(last )
  }
  const maturity = last + couponSpaceSec;

  return {
    creationDate: toSec(Date.now()),
    issuanceDate: start,
    maturityDate: maturity,
    couponDates: coupons,
    defaultCutofftime: 17 * 3600
  }
}

/**
 * Mine a block and give it a specific timestamp in seconds
 * @param {number} timestampSec the new block timestamp 
 * @returns void
 */
export let mineBlock: (timestampSec: number)=>Promise<void> = (timestampSec)=>Promise.reject(new Error("mineBlock not initialized. Call initWeb3Time first"));

/**
 * Returns the timestamp (in sec) of the provided block number
 * @param block {number} the block number or undefined to get the last block
 * @returns number
 */
export let blockTimestamp: (block?: number)=>Promise<number> = (block)=>Promise.reject(new Error("blockTimestamp not initialized. Call initWeb3Time first"));
export function initWeb3Time(web3: Web3) {
  web3.extend({
    property: "time",
    methods: [{
      name: 'mine',
      call: 'evm_mine',
      params: 1,
      inputFormatter: [Web3Utils.numberToHex] as any[],
    }]
  })

  mineBlock = (web3 as any).time.mine;

  blockTimestamp = async (blockNumber)=>{
    if (blockNumber == undefined) {
      blockNumber = await web3.eth.getBlockNumber();
    }
    const block = await web3.eth.getBlock(blockNumber)
    return typeof block.timestamp == "string"?Number.parseInt(block.timestamp): block.timestamp;
  }
}