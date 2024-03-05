/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  PausableInternal,
  PausableInternalInterface,
} from "../../../contracts/security/PausableInternal";

const _abi = [
  {
    inputs: [],
    name: "Pausable__NotPaused",
    type: "error",
  },
  {
    inputs: [],
    name: "Pausable__Paused",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
] as const;

export class PausableInternal__factory {
  static readonly abi = _abi;
  static createInterface(): PausableInternalInterface {
    return new Interface(_abi) as PausableInternalInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): PausableInternal {
    return new Contract(address, _abi, runner) as unknown as PausableInternal;
  }
}