// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { ISmartContractAccessManagement } from "./ISmartContractAccessManagement.sol";
import { SmartContractAccessManagementInternal } from "./SmartContractAccessManagementInternal.sol";

contract SmartContractAccessManagement is
    ISmartContractAccessManagement,
    SmartContractAccessManagementInternal
{
    /**
     * @inheritdoc ISmartContractAccessManagement
     */
    function isCallerApprovedSmartContract()
        external
        view
        override
        returns (bool)
    {
        return _isCallerApprovedSmartContract();
    }

    /**
     * @inheritdoc ISmartContractAccessManagement
     */
    function isContractAllowed(
        address contractAddress_
    ) public view returns (bool) {
        return _isContractAllowed(contractAddress_);
    }

    /**
     * @inheritdoc ISmartContractAccessManagement
     */
    function enableContractToWhitelist(bytes32 contractHash) public override {
        _enableContractToWhitelist(contractHash);
    }

    /**
     * @inheritdoc ISmartContractAccessManagement
     */
    function disableContractFromWhitelist(
        bytes32 contractHash
    ) public override {
        _disableContractFromWhitelist(contractHash);
    }

    /**
     * @inheritdoc ISmartContractAccessManagement
     */
    function atReturningHash(address addr_) public view returns (bytes32 hash) {
        return _atReturningHash(addr_);
    }
}
