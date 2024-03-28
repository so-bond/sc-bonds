// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { IRegisterMetadata } from "./IRegisterMetadata.sol";
import { RegisterMetadataInternal } from "./RegisterMetadataInternal.sol";

contract RegisterMetadata is IRegisterMetadata, RegisterMetadataInternal {
    /**
     * @inheritdoc IRegisterMetadata
     */
    function setName(string memory name_) public {
        _setName(name_);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function setIsinSymbol(string memory isinSymbol) public {
        _setIsinSymbol(isinSymbol);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function setCurrency(bytes32 currency) public {
        _setCurrency(currency);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function getCreationDate() public view returns (uint256) {
        return _getCreationDate();
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function getIssuanceDate() public view returns (uint256) {
        return _getIssuanceDate();
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function setCreationDate(uint256 creationDate) public {
        _setCreationDate(creationDate);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function setIssuanceDate(uint256 issuanceDate) public {
        _setIssuanceDate(issuanceDate);
    }

    /**
     * @inheritdoc IRegisterMetadata
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

    /**
     * @inheritdoc IRegisterMetadata
     */
    function addCouponDate(uint256 date) public {
        _addCouponDate(date);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function delCouponDate(uint256 date) public {
        _delCouponDate(date);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function setExpectedSupply(uint256 expectedSupply) public {
        _setExpectedSupply(expectedSupply);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function getBondData() public view returns (BondData memory) {
        return _getBondData();
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function getBondCouponRate() public view returns (uint256) {
        return _getBondCouponRate();
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function getBondUnitValue() public view returns (uint256) {
        return _getBondUnitValue();
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function primaryIssuanceAccount()
        public
        view
        virtual
        override
        returns (address)
    {
        return _primaryIssuanceAccount();
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function returnBalanceToPrimaryIssuanceAccount(
        address investor
    ) public override returns (bool) {
        return _returnBalanceToPrimaryIssuanceAccount(investor);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function checkIfCouponDateExists(
        uint256 _couponDate
    ) public view returns (bool) {
        return _checkIfCouponDateExists(_couponDate);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function checkIfMaturityDateExists(
        uint256 _maturityDate
    ) external view returns (bool) {
        return _checkIfMaturityDateExists(_maturityDate);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function makeReady() public {
        _makeReady();
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function revertReady() public {
        _revertReady();
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function publicMessage(address to, string memory message) public {
        _publicMessage(to, message);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function setCurrentCouponDate(
        uint256 couponDate_,
        uint256 recordDatetime_
    ) external override {
        _setCurrentCouponDate(couponDate_, recordDatetime_);
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function toggleFrozen() external override {
        _toggleFrozen();
    }

    /**
     * @inheritdoc IRegisterMetadata
     */
    function status() public view override returns (Status) {
        return _status();
    }
}
