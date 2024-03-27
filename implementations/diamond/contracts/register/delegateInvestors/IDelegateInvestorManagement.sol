// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IDelegateInvestorManagementInternal } from "./IDelegateInvestorManagementInternal.sol";

interface IDelegateInvestorManagement is IDelegateInvestorManagementInternal {
    /**
     * @notice Set the delegate for a custodian. The target custodian is the msg sender.
     * @param delegate The delegate address to set
     */
    function setCustodianDelegate(
        address delegate
    ) external;
    
    /**
     * @notice Unset the delegate for a custodian. The target custodian is the msg sender.
     * @param delegate The delegate address to unset
     */
    function unsetCustodianDelegate(
        address delegate
    ) external;

    /**
     * @notice Check if the custodian has delegated part of their role to the delegate address.
     * @param custodian The custodian address
     * @param delegate The delegate address
     * @return True if the custodian address has the CST role and has delegated part of their role to the delegate address.
     */
    function isCustodianDelegate(address custodian, address delegate) external view returns (bool);

    /**
     * @notice Get the delegate for a custodian.
     * @param custodian The custodian address
     * @return The delegate address
     */
    function getCustodianDelegate(address custodian) external view returns (address memory);

    /**
     * @notice Enable an investor to the whitelist acting as a delegator.
     * @param investor The investor address
     * @param delegator The actor to enable the investor as
     */
    function delegateEnableInvestorToWhitelist(address investor_, address delegator) external;

    /**
     * @notice Disable an investor to the whitelist acting as a delegator.
     * @param investor The investor address
     * @param delegator The actor to disable the investor as
     */
    function delegateDisableInvestorFromWhitelist(address investor_, address delegator) external;
}
