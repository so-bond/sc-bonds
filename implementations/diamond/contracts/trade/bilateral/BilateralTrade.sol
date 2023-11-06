// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { ITrade } from "../ITrade.sol";
import { IBilateralTrade } from "./IBilateralTrade.sol";
import { BilateralTradeInternal } from "./BilateralTradeInternal.sol";
import { IRegister } from "../../register/IRegister.sol";

contract BilateralTrade is IBilateralTrade, BilateralTradeInternal {
    /// @inheritdoc ITrade
    function register() external view returns (IRegister) {
        return _register();
    }

    /// @inheritdoc ITrade
    function status() external view returns (TradeStatus) {
        return _status();
    }

    /// @inheritdoc ITrade
    function paymentID() external view returns (bytes8) {
        return _paymentID();
    }

    /// @inheritdoc ITrade
    function getDetails() external view returns (TradeDetail memory) {
        return _getDetails();
    }

    /// @inheritdoc ITrade
    function sellerAccount() external view returns (address) {
        return _sellerAccount();
    }

    /// @inheritdoc ITrade
    function buyerAccount() external view returns (address) {
        return _buyerAccount();
    }

    /// @inheritdoc IBilateralTrade
    function setDetails(TradeDetail memory _details) external {
        _setDetails(_details);
    }

    /// @inheritdoc IBilateralTrade
    function approve() external returns (TradeStatus) {
        return _approve();
    }

    /// @inheritdoc IBilateralTrade
    function reject() external {
        _reject();
    }

    /// @inheritdoc IBilateralTrade
    function executeTransfer() external returns (bool) {
        return _executeTransfer();
    }
}
