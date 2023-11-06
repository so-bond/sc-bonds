// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IPrimaryIssuance, ITrade } from "./IPrimaryIssuance.sol";
import { PrimaryIssuanceInternal } from "./PrimaryIssuanceInternal.sol";

import { IRegister } from "../../register/IRegister.sol";

contract PrimaryIssuance is IPrimaryIssuance, PrimaryIssuanceInternal {
    /// @inheritdoc IPrimaryIssuance
    function primaryIssuanceAccount()
        public
        view
        virtual
        override
        returns (address)
    {
        return _primaryIssuanceAccount();
    }

    /// @inheritdoc IPrimaryIssuance
    function account() public view returns (address) {
        return _account();
    }

    /// @inheritdoc IPrimaryIssuance
    function offerPrice() public view returns (uint256) {
        return _offerPrice();
    }

    /// @inheritdoc IPrimaryIssuance
    function validate() public {
        _validate();
    }

    /// @inheritdoc IPrimaryIssuance
    function reject() public {
        _reject();
    }

    // /// @inheritdoc ITrade
    function register() public view returns (IRegister) {
        return _register();
    }

    /// @inheritdoc ITrade
    function status() public view returns (TradeStatus) {
        return status_();
    }

    /// @inheritdoc ITrade
    function paymentID() public view returns (bytes8) {
        return _paymentID();
    }

    /// @inheritdoc ITrade
    function getDetails() public view returns (TradeDetail memory) {
        return _getDetails();
    }

    /// @inheritdoc ITrade
    function sellerAccount() public view returns (address) {
        return _sellerAccount();
    }

    /// @inheritdoc ITrade
    function buyerAccount() public view returns (address) {
        return _buyerAccount();
    }
}
