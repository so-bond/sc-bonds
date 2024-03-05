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

export interface ICouponInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "computesCouponAmount"
      | "setDateAsCurrentCoupon"
      | "setNbDays"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "computesCouponAmount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setDateAsCurrentCoupon",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setNbDays",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "computesCouponAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDateAsCurrentCoupon",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setNbDays", data: BytesLike): Result;
}

export interface ICoupon extends BaseContract {
  connect(runner?: ContractRunner | null): ICoupon;
  waitForDeployment(): Promise<this>;

  interface: ICouponInterface;

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

  computesCouponAmount: TypedContractMethod<[], [void], "nonpayable">;

  setDateAsCurrentCoupon: TypedContractMethod<[], [void], "nonpayable">;

  setNbDays: TypedContractMethod<[_nbDays: BigNumberish], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "computesCouponAmount"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setDateAsCurrentCoupon"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setNbDays"
  ): TypedContractMethod<[_nbDays: BigNumberish], [void], "nonpayable">;

  filters: {};
}