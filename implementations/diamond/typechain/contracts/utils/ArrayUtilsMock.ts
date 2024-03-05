/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface ArrayUtilsMockInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "max(uint256[])"
      | "max(bytes32[])"
      | "max(address[])"
      | "min(bytes32[])"
      | "min(address[])"
      | "min(uint256[])"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "max(uint256[])",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "max(bytes32[])",
    values: [BytesLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "max(address[])",
    values: [AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "min(bytes32[])",
    values: [BytesLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "min(address[])",
    values: [AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "min(uint256[])",
    values: [BigNumberish[]]
  ): string;

  decodeFunctionResult(
    functionFragment: "max(uint256[])",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "max(bytes32[])",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "max(address[])",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "min(bytes32[])",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "min(address[])",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "min(uint256[])",
    data: BytesLike
  ): Result;
}

export interface ArrayUtilsMock extends BaseContract {
  connect(runner?: ContractRunner | null): ArrayUtilsMock;
  waitForDeployment(): Promise<this>;

  interface: ArrayUtilsMockInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  "max(uint256[])": TypedContractMethod<
    [array: BigNumberish[]],
    [bigint],
    "view"
  >;

  "max(bytes32[])": TypedContractMethod<[array: BytesLike[]], [string], "view">;

  "max(address[])": TypedContractMethod<
    [array: AddressLike[]],
    [string],
    "view"
  >;

  "min(bytes32[])": TypedContractMethod<[array: BytesLike[]], [string], "view">;

  "min(address[])": TypedContractMethod<
    [array: AddressLike[]],
    [string],
    "view"
  >;

  "min(uint256[])": TypedContractMethod<
    [array: BigNumberish[]],
    [bigint],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "max(uint256[])"
  ): TypedContractMethod<[array: BigNumberish[]], [bigint], "view">;
  getFunction(
    nameOrSignature: "max(bytes32[])"
  ): TypedContractMethod<[array: BytesLike[]], [string], "view">;
  getFunction(
    nameOrSignature: "max(address[])"
  ): TypedContractMethod<[array: AddressLike[]], [string], "view">;
  getFunction(
    nameOrSignature: "min(bytes32[])"
  ): TypedContractMethod<[array: BytesLike[]], [string], "view">;
  getFunction(
    nameOrSignature: "min(address[])"
  ): TypedContractMethod<[array: AddressLike[]], [string], "view">;
  getFunction(
    nameOrSignature: "min(uint256[])"
  ): TypedContractMethod<[array: BigNumberish[]], [bigint], "view">;

  filters: {};
}