// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { ISmartContractAccessManagementInternal } from "./ISmartContractAccessManagementInternal.sol";

interface ISmartContractAccessManagement is
    ISmartContractAccessManagementInternal
{
    /**
     * @notice Check if a smart contract is whitelisted
     * @return True if the smart contract is whitelisted
     */
    function isCallerApprovedSmartContract() external view returns (bool);

    /**
     * @notice Check if a smart contract is whitelisted through the hash of its bytecode
     * @param contractAddress The hash of the smart contract to check
     * @return True if the smart contract is whitelisted
     */
    function isContractAllowed(
        address contractAddress
    ) external view returns (bool);

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
     * @notice This function returns the bytecode'shash of the deployed smart contract address
     * @param addr The address of the smart contract
     * @return The hash of the smart contract
     *
     * source : https://gist.github.com/andreafspeziale/557fa432e9929ccf049459972e322bdf
     */
    function atReturningHash(address addr) external view returns (bytes32);
}
