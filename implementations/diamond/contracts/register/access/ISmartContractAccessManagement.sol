// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { ISmartContractAccessManagementInternal } from "./ISmartContractAccessManagementInternal.sol";

interface ISmartContractAccessManagement is
    ISmartContractAccessManagementInternal
{
    /**
     * @notice Enable a smart contract to the whitelist
     * @param contractHash The hash of the smart contract to enable
     */
    function enableContractToWhitelist(bytes32 contractHash) external;

    /**
     * @notice Disable a smart contract from the whitelist
     * @param contractHash The hash of the smart contract to disable
     */
    function disableContractFromWhitelist(bytes32 contractHash) external;

    /**
     * @notice Check if a smart contract is whitelisted
     * @return True if the smart contract is whitelisted
     */
    function isCallerApprovedSmartContract() external view returns (bool);

    /**
     * @notice Check if a smart contract is whitelisted through the hash of its bytecode
     * @param contractAddress_ The hash of the smart contract to check
     * @return True if the smart contract is whitelisted
     */
    function isContractAllowed(
        address contractAddress_
    ) external view returns (bool);
}
