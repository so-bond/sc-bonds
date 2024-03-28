// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { IRegisterMetadataInternal } from "./IRegisterMetadataInternal.sol";

interface IRegisterMetadata is IRegisterMetadataInternal {
    /**
     * @notice Set the name of this contract
     * @param name_ The name of the contract
     */
    function setName(string memory name_) external;

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
     * @notice Check if a coupon date exists
     * @param _couponDate The coupon date
     * @return True if exists
     */
    function checkIfCouponDateExists(
        uint256 _couponDate
    ) external returns (bool);

    /**
     * @notice Check if a maturity date exists
     * @param _maturityDate The maturity date
     * @return True if exists
     */
    function checkIfMaturityDateExists(
        uint256 _maturityDate
    ) external returns (bool);

    /**
     * @notice Initialize the total amount definitively and freeze the register attributes.
     *
     * @dev Takes the expected supply to mint to the security issuance account and set the status to Ready.
     */
    function makeReady() external;

    /**
     * @notice Revert the register attributes to draft status.
     */
    function revertReady() external;

    /**
     * @notice Send a message to a specific address
     * @param to The address to send the message to
     * @param message The message to send
     */
    function publicMessage(address to, string memory message) external;

    /**
     * @notice Set the current coupon date
     * @param couponDate_ The coupon date
     * @param recordDatetime_ The record date
     *
     * @dev This function is called by the Coupon when Paying Agent validates the coupon Date.
     */
    function setCurrentCouponDate(
        uint256 couponDate_,
        uint256 recordDatetime_
    ) external;

    /**
     * @notice Toggle frozen status
     */
    function toggleFrozen() external;

    /**
     * @notice Get the status of the register
     * @return The status
     */
    function status() external view returns (Status);
}
