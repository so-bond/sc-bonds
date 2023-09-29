/** Module for test of solidity smart contract that simplifies the initialization
 *
 * hanldes dates in seconds
 */

import * as hardhatHelpers from '@nomicfoundation/hardhat-network-helpers';

const _num = (v: number | string) =>
  typeof v == 'string' ? Number.parseInt(v) : v;
const toSec = (asMs: number) => Math.floor(_num(asMs) / 1000);
const timePart = (asMs: number) => toSec(_num(asMs) % (24 * 3600 * 1000));
const datePart = (asMs: number) => toSec(_num(asMs)) - timePart(asMs);

export function today(): number {
  return datePart(Date.now());
}

export function time(): number {
  return timePart(Date.now());
}

export function makeDateTime(dateSec: number, timeSec: number): number {
  return datePart(dateSec * 1000) + timePart(timeSec * 1000);
}

export function addPart(
  asSec: number,
  part: 'Y' | 'M' | 'D' | 'H' | 'm' | 's',
  v: number
): number {
  let dt = new Date(asSec * 1000);
  let ms = Date.UTC(
    dt.getUTCFullYear() + (part == 'Y' ? v : 0),
    dt.getUTCMonth() + (part == 'M' ? v : 0),
    dt.getUTCDate() + (part == 'D' ? v : 0),
    dt.getUTCHours() + (part == 'H' ? v : 0),
    dt.getUTCMinutes() + (part == 'm' ? v : 0),
    dt.getUTCSeconds() + (part == 's' ? v : 0),
    dt.getUTCMilliseconds()
  );
  return toSec(ms);
}

export function future(moveToSec: number): number {
  return addPart(toSec(Date.now()), 's', moveToSec);
}

export function makeBondDate(
  nbCoupons: number = 3,
  couponSpaceSec: number = 30 * 24 * 3600
) {
  const start = today();
  const coupons: number[] = [];
  let last = start;
  for (let i = 0; i < nbCoupons; i++) {
    last = last + couponSpaceSec;
    coupons.push(last);
  }
  const maturity = last + couponSpaceSec;

  return {
    creationDate: toSec(Date.now()),
    issuanceDate: start,
    maturityDate: maturity,
    couponDates: coupons,
    defaultCutofftime: 17 * 3600
  };
}

/**
 * Mine a block and give it a specific timestamp in seconds
 * @param {number} timestampSec the new block timestamp
 * @returns void
 */
export let mineBlock = (timestampSec: number) => {
  return hardhatHelpers.time.increaseTo(timestampSec);
};
