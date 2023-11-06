// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegisterMetadata } from "./IRegisterMetadata.sol";
import { RegisterMetadataInternal } from "./RegisterMetadataInternal.sol";

contract RegisterMetadata is IRegisterMetadata, RegisterMetadataInternal {
    /// @inheritdoc IRegisterMetadata
    function setIsinSymbol(string memory isinSymbol) public {
        _setIsinSymbol(isinSymbol);
    }

    /// @inheritdoc IRegisterMetadata
    function setCurrency(bytes32 currency) public {
        _setCurrency(currency);
    }

    /// @inheritdoc IRegisterMetadata
    function getCreationDate() public view returns (uint256) {
        return _getCreationDate();
    }

    /// @inheritdoc IRegisterMetadata
    function getIssuanceDate() public view returns (uint256) {
        return _getIssuanceDate();
    }

    /// @inheritdoc IRegisterMetadata
    function setCreationDate(uint256 creationDate) public {
        _setCreationDate(creationDate);
    }

    /// @inheritdoc IRegisterMetadata
    function setIssuanceDate(uint256 issuanceDate) public {
        _setIssuanceDate(issuanceDate);
    }

    /// @inheritdoc IRegisterMetadata
    function setBondData(
        string memory name_,
        uint256 expectedSupply_,
        bytes32 currency_,
        uint256 unitVal_,
        uint256 couponRate_,
        uint256 issuanceDate_,
        uint256 maturityDate_,
        uint256 cutOffTime_
    ) public {
        _setBondData(
            name_,
            expectedSupply_,
            currency_,
            unitVal_,
            couponRate_,
            issuanceDate_,
            maturityDate_,
            cutOffTime_
        );
    }

    /// @inheritdoc IRegisterMetadata
    function addCouponDate(uint256 date) public {
        _addCouponDate(date);
    }

    /// @inheritdoc IRegisterMetadata
    function delCouponDate(uint256 date) public {
        _delCouponDate(date);
    }

    /// @inheritdoc IRegisterMetadata
    function setExpectedSupply(uint256 expectedSupply) public {
        _setExpectedSupply(expectedSupply);
    }

    /// @inheritdoc IRegisterMetadata
    function getBondData() public view returns (BondData memory) {
        return _getBondData();
    }

    /// @inheritdoc IRegisterMetadata
    function getBondCouponRate() public view returns (uint256) {
        return _getBondCouponRate();
    }

    /// @inheritdoc IRegisterMetadata
    function getBondUnitValue() public view returns (uint256) {
        return _getBondUnitValue();
    }

    /// @inheritdoc IRegisterMetadata
    function primaryIssuanceAccount()
        public
        view
        virtual
        override
        returns (address)
    {
        return _primaryIssuanceAccount();
    }

    function returnBalanceToPrimaryIssuanceAccount(
        address investor
    ) public override returns (bool) {
        return _returnBalanceToPrimaryIssuanceAccount(investor);
    }

    /// @inheritdoc IRegisterMetadata
    function getAllInvestors() public view returns (address[] memory) {
        return _getAllInvestors();
    }

    /// @inheritdoc IRegisterMetadata
    function disableInvestorFromWhitelist(address investor_) public {
        _disableInvestorFromWhitelist(investor_);
    }

    ///@inheritdoc IRegisterMetadata
    function enableInvestorToWhitelist(address investor_) public {
        _enableInvestorToWhitelist(investor_);
    }

    function investorsAllowed(address investor) public view returns (bool) {
        return _investorsAllowed(investor);
    }

    /// @inheritdoc IRegisterMetadata
    function investorCustodian(address investor) public view returns (address) {
        return _investorCustodian(investor);
    }

    function checkIfCouponDateExists(
        uint256 _couponDate
    ) public view returns (bool) {
        return _checkIfCouponDateExists(_couponDate);
    }

    function checkIfMaturityDateExists(
        uint256 _maturityDate
    ) external view returns (bool) {
        return _checkIfMaturityDateExists(_maturityDate);
    }

    /**
     * @notice Initialize the total amount definitively and freeze the register attributes.
     * Takes the expected supply to mint to the security issuance account and set the status to Ready.
     */
    function makeReady() public {
        _makeReady();
    }

    /**
     * @notice In case of an error detected after the bond was made ready but before it was issued
     * place the bond back to draft mode
     */
    function revertReady() public {
        _revertReady();
    }

    /**
     * @notice This function intent to allow institutions to communicate between them
     * @param to The address of the receiver
     * @param message The message to send
     */
    function publicMessage(address to, string memory message) public {
        _publicMessage(to, message);
    }

    /**
     * @notice this function is called by Coupon.sol when Paying Agent validates the coupon Date.
     * @param couponDate_ The coupon date to set
     * @param recordDatetime_ The record date to set
     */
    function setCurrentCouponDate(
        uint256 couponDate_,
        uint256 recordDatetime_
    ) external override {
        _setCurrentCouponDate(couponDate_, recordDatetime_);
    }

    function getInvestorListAtCoupon(
        uint256 CouponDate
    ) public view override returns (address[] memory) {
        return _getInvestorListAtCoupon(CouponDate);
    }

    function toggleFrozen() external override {
        _toggleFrozen();
    }

    function status() public view override returns (Status) {
        return _status();
    }
}
