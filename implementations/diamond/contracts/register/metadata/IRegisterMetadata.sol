// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegisterMetadataInternal } from "./IRegisterMetadataInternal.sol";

interface IRegisterMetadata is IRegisterMetadataInternal {
    /**
     * @notice Set the ISIN Symbol of the registar
     * @param isinSymbol The ISIN Symbol
     */
    function setIsinSymbol(string memory isinSymbol) external;

    /**
     * @notice Set the currency of the registar
     * @param currency The currency
     */
    function setCurrency(bytes32 currency) external;

    /**
     * @notice Get the creation date of the registar
     * @return The creation date
     */
    function getCreationDate() external view returns (uint256);

    /**
     * @notice Get the Issuance date of the Security Token
     * @return The Issuance date
     */
    function getIssuanceDate() external view returns (uint256);

    /**
     * @notice Set the creation date of the registar
     * @param creationDate The creation date
     */
    function setCreationDate(uint256 creationDate) external;

    /**
     * @notice Set the creation date of the registar
     * @param issuanceDate The creation date
     */
    function setIssuanceDate(uint256 issuanceDate) external;

    /**
     * @notice Set Bond data
     * @param name_ The name of the bond
     * @param expectedSupply_ The expected supply
     * @param currency_ The currency
     * @param unitVal_ The unit value
     * @param couponRate_ The coupon rate
     * @param issuanceDate_ The issuance date
     * @param maturityDate_ The maturity date
     * @param cutOffTime_ The cut off time
     */
    function setBondData(
        string memory name_,
        uint256 expectedSupply_,
        bytes32 currency_,
        uint256 unitVal_,
        uint256 couponRate_,
        uint256 issuanceDate_,
        uint256 maturityDate_,
        uint256 cutOffTime_
    ) external;

    /**
     * @notice Add a coupon date
     * @param date The date to add
     */
    function addCouponDate(uint256 date) external;

    /**
     * @notice Delete a coupon date
     * @param date The date to delete
     */
    function delCouponDate(uint256 date) external;

    /**
     * @notice Set expected supply
     * @param expectedSupply The expected supply
     */
    function setExpectedSupply(uint256 expectedSupply) external;

    /**
     * @notice Get the Bond
     * @return The bond data
     */
    function getBondData() external view returns (BondData memory);

    /**
     * @notice Get Bond coupon rate
     * @return The bond coupon rate
     */
    function getBondCouponRate() external view returns (uint256);

    /**
     * @notice Get Bond unit value
     * @return The bond unit value
     */
    function getBondUnitValue() external view returns (uint256);

    /**
     * @notice Get primary issuance account
     * @return The primary issuance account
     */
    function primaryIssuanceAccount() external view returns (address);

    /**
     * @notice Get balance of primary issuance account
     * @param investor The investor address
     * @return True if allowed
     */
    function returnBalanceToPrimaryIssuanceAccount(
        address investor
    ) external returns (bool);

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

    function checkIfCouponDateExists(
        uint256 _couponDate
    ) external returns (bool);

    function checkIfMaturityDateExists(
        uint256 _maturityDate
    ) external returns (bool);

    function makeReady() external;

    function revertReady() external;

    function publicMessage(address to, string memory message) external;

    function setCurrentCouponDate(
        uint256 couponDate_,
        uint256 recordDatetime_
    ) external;

    function getInvestorListAtCoupon(
        uint256 CouponDate
    ) external returns (address[] memory);

    function toggleFrozen() external;

    function status() external view returns (Status);
}
