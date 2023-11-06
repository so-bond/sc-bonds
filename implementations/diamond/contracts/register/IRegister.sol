// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegisterMetadata } from "./metadata/IRegisterMetadata.sol";
import { IRegisterRoleManagement } from "./role/IRegisterRoleManagement.sol";
import { ICouponSnapshotManagement } from "./coupon/ICouponSnapshotManagement.sol";
import { ISmartContractAccessManagement } from "./access/ISmartContractAccessManagement.sol";

interface IRegister is
    IRegisterMetadata,
    IRegisterRoleManagement,
    ICouponSnapshotManagement,
    ISmartContractAccessManagement
{}
