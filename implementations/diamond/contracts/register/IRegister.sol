// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { IRegisterMetadata } from "./metadata/IRegisterMetadata.sol";
import { ICouponSnapshotManagement } from "./snapshot/ICouponSnapshotManagement.sol";
import { IRegisterRoleManagement } from "./role/IRegisterRoleManagement.sol";
import { ISmartContractAccessManagement } from "./access/ISmartContractAccessManagement.sol";
import { IInvestorManagement } from "./investors/IInvestorManagement.sol";

interface IRegister is
    IRegisterMetadata,
    ICouponSnapshotManagement,
    IRegisterRoleManagement,
    ISmartContractAccessManagement,
    IInvestorManagement
{}
