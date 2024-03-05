/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IDiamondCutInternal,
  IDiamondCutInternalInterface,
} from "../../../../contracts/diamond/cut/IDiamondCutInternal";

const _abi = [
  {
    inputs: [],
    name: "DiamondCut__InvalidInitializationParameters",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondCut__RemoveTargetNotZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondCut__ReplaceTargetIsIdentical",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondCut__SelectorAlreadyAdded",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondCut__SelectorIsImmutable",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondCut__SelectorNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondCut__SelectorNotSpecified",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondCut__TargetHasNoCode",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "enum IDiamondCutInternal.FacetCutAction",
            name: "action",
            type: "uint8",
          },
          {
            internalType: "bytes4[]",
            name: "selectors",
            type: "bytes4[]",
          },
        ],
        indexed: false,
        internalType: "struct IDiamondCutInternal.FacetCut[]",
        name: "facetCuts",
        type: "tuple[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "DiamondCut",
    type: "event",
  },
] as const;

export class IDiamondCutInternal__factory {
  static readonly abi = _abi;
  static createInterface(): IDiamondCutInternalInterface {
    return new Interface(_abi) as IDiamondCutInternalInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IDiamondCutInternal {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IDiamondCutInternal;
  }
}