// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { ISmartContractAccessManagement } from "./ISmartContractAccessManagement.sol";
import { SmartContractAccessManagementInternal } from "./SmartContractAccessManagementInternal.sol";

contract SmartContractAccessManagement is
    ISmartContractAccessManagement,
    SmartContractAccessManagementInternal
{
    /// @inheritdoc ISmartContractAccessManagement
    function enableContractToWhitelist(bytes32 contractHash) public override {
        _enableContractToWhitelist(contractHash);
    }

    /// @inheritdoc ISmartContractAccessManagement
    function disableContractFromWhitelist(
        bytes32 contractHash
    ) public override {
        _disableContractFromWhitelist(contractHash);
    }

    /// @inheritdoc ISmartContractAccessManagement
    function isCallerApprovedSmartContract()
        external
        view
        override
        returns (bool)
    {
        return _isCallerApprovedSmartContract();
    }

    /// @inheritdoc ISmartContractAccessManagement
    function isContractAllowed(
        address contractAddress_
    ) public view returns (bool) {
        return _isContractAllowed(contractAddress_);
    }
}
