/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IDiamondBase,
  IDiamondBaseInterface,
} from "../../../../contracts/diamond/base/IDiamondBase";

const _abi = [
  {
    inputs: [],
    name: "Proxy__ImplementationIsNotContract",
    type: "error",
  },
] as const;

export class IDiamondBase__factory {
  static readonly abi = _abi;
  static createInterface(): IDiamondBaseInterface {
    return new Interface(_abi) as IDiamondBaseInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IDiamondBase {
    return new Contract(address, _abi, runner) as unknown as IDiamondBase;
  }
}