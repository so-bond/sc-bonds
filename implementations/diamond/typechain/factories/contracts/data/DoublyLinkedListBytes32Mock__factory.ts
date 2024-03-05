/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  DoublyLinkedListBytes32Mock,
  DoublyLinkedListBytes32MockInterface,
} from "../../../contracts/data/DoublyLinkedListBytes32Mock";

const _abi = [
  {
    inputs: [],
    name: "DoublyLinkedList__InvalidInput",
    type: "error",
  },
  {
    inputs: [],
    name: "DoublyLinkedList__NonExistentEntry",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "value",
        type: "bytes32",
      },
    ],
    name: "contains",
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
        internalType: "bytes32",
        name: "prevValue",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "newValue",
        type: "bytes32",
      },
    ],
    name: "insertAfter",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "nextValue",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "newValue",
        type: "bytes32",
      },
    ],
    name: "insertBefore",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "value",
        type: "bytes32",
      },
    ],
    name: "next",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pop",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "value",
        type: "bytes32",
      },
    ],
    name: "prev",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "value",
        type: "bytes32",
      },
    ],
    name: "push",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "value",
        type: "bytes32",
      },
    ],
    name: "remove",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "oldValue",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "newValue",
        type: "bytes32",
      },
    ],
    name: "replace",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "shift",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "value",
        type: "bytes32",
      },
    ],
    name: "unshift",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561000f575f80fd5b506105a98061001d5f395ff3fe608060405234801561000f575f80fd5b50600436106100c4575f3560e01c806325a311251161007d578063b298e36b11610058578063b298e36b1461016d578063d1d0969514610180578063efeb67ac14610193575f80fd5b806325a311251461013f57806395bc267314610152578063a4ece52c14610165575f80fd5b806312fc41ca116100ad57806312fc41ca14610101578063165c089f146101095780631d1a696d1461012c575f80fd5b806302d3af5b146100c857806312718988146100ee575b5f80fd5b6100db6100d636600461053c565b6101a6565b6040519081526020015b60405180910390f35b6100db6100fc36600461053c565b6101b7565b6100db6101c2565b61011c610117366004610553565b6101d1565b60405190151581526020016100e5565b61011c61013a36600461053c565b6101e4565b61011c61014d366004610553565b6101ef565b61011c61016036600461053c565b6101fb565b6100db610206565b61011c61017b36600461053c565b610210565b61011c61018e36600461053c565b61021b565b61011c6101a1366004610553565b610226565b5f6101b18183610232565b92915050565b5f6101b1818361023d565b5f6101cc5f610248565b905090565b5f6101dd818484610252565b9392505050565b5f6101b18183610266565b5f6101dd818484610271565b5f6101b1818361027d565b5f6101cc5f610288565b5f6101b18183610292565b5f6101b1818361029d565b5f6101dd8184846102a8565b5f6101dd83836102b4565b5f6101dd8383610302565b5f6101b182610331565b5f61025e84848461034e565b949350505050565b5f6101dd8383610364565b5f61025e84848461039d565b5f6101dd83836103b3565b5f6101b18261041e565b5f6101dd8383610429565b5f6101dd838361043f565b5f61025e84848461044f565b5f8181526020839052604090205481158015906102cf575080155b80156102e45750816102e18483610302565b14155b156101b157604051630f71d89360e11b815260040160405180910390fd5b5f818152600183016020526040902054811580159061031f575080155b80156102e45750816102e184836102b4565b5f61033c82826102b4565b905061034882826103b3565b50919050565b5f61025e848461035e87876102b4565b856104ba565b5f81158015906101dd57505f828152602084905260409020541515806101dd5750505f8080526001929092016020526040909120541490565b5f61025e846103ac8686610302565b85856104ba565b5f6103be8383610364565b156101b1576103fd836103d18585610302565b6103db86866102b4565b5f82815260208481526040808320849055928252600190940190935290912055565b505f9081526001828101602090815260408084208490559390529181205590565b5f61033c8282610302565b5f6101dd836104388184610302565b5f856104ba565b5f6101dd838261035e82826102b4565b5f61045a8484610364565b61047757604051630f71d89360e11b815260040160405180910390fd5b61048f846104858686610302565b61035e87876102b4565b905080156101dd575f8381526001850160209081526040808320839055908690528120559392505050565b5f8181036104f4576040517f2ea5817800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6104fe8583610364565b61025e57505f838152602085815260408083208490558383526001808801808452828520979097559682528083208590559382529390935291205590565b5f6020828403121561054c575f80fd5b5035919050565b5f8060408385031215610564575f80fd5b5050803592602090910135915056fea264697066735822122074e0487a730373c6fc6b3f0d655c2c37ef88947f3827b08c27a0cac58eb0959b64736f6c63430008140033";

type DoublyLinkedListBytes32MockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DoublyLinkedListBytes32MockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DoublyLinkedListBytes32Mock__factory extends ContractFactory {
  constructor(...args: DoublyLinkedListBytes32MockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      DoublyLinkedListBytes32Mock & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): DoublyLinkedListBytes32Mock__factory {
    return super.connect(runner) as DoublyLinkedListBytes32Mock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DoublyLinkedListBytes32MockInterface {
    return new Interface(_abi) as DoublyLinkedListBytes32MockInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): DoublyLinkedListBytes32Mock {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as DoublyLinkedListBytes32Mock;
  }
}