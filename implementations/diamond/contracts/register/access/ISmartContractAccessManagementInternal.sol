// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

interface ISmartContractAccessManagementInternal {
    /**
     * @notice Triggered when a smart contract is enabled
     * @param contractHash The hash of the smart contract
     */
    event EnableContract(bytes32 contractHash);

    /**
     * @notice Triggered when a smart contract is disabled
     * @param contractHash The hash of the smart contract
     */
    event DisableContract(bytes32 contractHash);
}
