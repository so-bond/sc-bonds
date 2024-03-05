/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IRegisterRoleManagement,
  IRegisterRoleManagementInterface,
} from "../../../../src/intf/IRegister.sol/IRegisterRoleManagement";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_addressForNewAdmin",
        type: "address",
      },
    ],
    name: "AdminChanged",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "changeAdminRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "bndAddress",
        type: "address",
      },
    ],
    name: "grantBndRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "cakAddress",
        type: "address",
      },
    ],
    name: "grantCakRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "cstAddress",
        type: "address",
      },
    ],
    name: "grantCstRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "cstAddress",
        type: "address",
      },
    ],
    name: "grantPayRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isBnD",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isCAK",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isCustodian",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isPay",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "bndAddress",
        type: "address",
      },
    ],
    name: "revokeBndRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "cakAddress",
        type: "address",
      },
    ],
    name: "revokeCakRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "cstAddress",
        type: "address",
      },
    ],
    name: "revokeCstRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "cstAddress",
        type: "address",
      },
    ],
    name: "revokePayRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IRegisterRoleManagement__factory {
  static readonly abi = _abi;
  static createInterface(): IRegisterRoleManagementInterface {
    return new Interface(_abi) as IRegisterRoleManagementInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IRegisterRoleManagement {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IRegisterRoleManagement;
  }
}