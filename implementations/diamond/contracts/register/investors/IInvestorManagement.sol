// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { IInvestorManagementInternal } from "./IInvestorManagementInternal.sol";

interface IInvestorManagement is IInvestorManagementInternal {
    /**
     * @notice Get list of all investors
     * @return The addresses of all investors
     */
    function getAllInvestors() external view returns (address[] memory);

    /**
     * @notice Disable an investor from the whitelist
     * @param investor The investor address
     */
    function disableInvestorFromWhitelist(address investor) external;

    /**
     * @notice Enable an investor to the whitelist
     * @param investor The investor address
     */
    function enableInvestorToWhitelist(address investor) external; //TODO: maybe expose getInvestorInfo(address investor) returns (InvestorInfo)

    /**
     * @notice Check if an investor is allowed
     * @param investor The investor address
     * @return True if allowed
     */
    function investorsAllowed(address investor) external view returns (bool);

    /**
     * @notice Returns the custodian for a given investor.
     * @param investor The investor address
     * @return The custodian address
     */
    function investorCustodian(
        address investor
    ) external view returns (address);
}
