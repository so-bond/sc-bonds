// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { IAccessControlInternal } from "../../access/rbac/IAccessControlInternal.sol";

interface IRegisterRoleManagementInternal is IAccessControlInternal {
    event AdminChanged(address indexed _addressForNewAdmin);
}
