// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

interface IDelegateInvestorManagementInternal {
    // Define structs, enums, events and errors used internally in the contract
    
    /**
     * @notice Triggered when a delegate is added for a given custodian.
     * @param custodian
     * @param delegate
     */
    event CustodianDelegateSet(address indexed custodian, address indexed delegate);

    /**
     * @notice Triggered when a delegate is removed for a given custodian.
     * @param custodian
     * @param delegate
     */
    event CustodianDelegateUnset(address indexed custodian, address indexed delegate);
}
