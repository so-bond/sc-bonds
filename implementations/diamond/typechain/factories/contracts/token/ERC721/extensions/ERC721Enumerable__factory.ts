/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ERC721Enumerable,
  ERC721EnumerableInterface,
} from "../../../../../contracts/token/ERC721/extensions/ERC721Enumerable";

const _abi = [
  {
    inputs: [],
    name: "EnumerableMap__IndexOutOfBounds",
    type: "error",
  },
  {
    inputs: [],
    name: "EnumerableSet__IndexOutOfBounds",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class ERC721Enumerable__factory {
  static readonly abi = _abi;
  static createInterface(): ERC721EnumerableInterface {
    return new Interface(_abi) as ERC721EnumerableInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ERC721Enumerable {
    return new Contract(address, _abi, runner) as unknown as ERC721Enumerable;
  }
}