// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IBilateralTradeInternal } from "./IBilateralTradeInternal.sol";
import { BilateralTradeStorage } from "./BilateralTradeStorage.sol";
import { IRegister } from "../../register/IRegister.sol";
import { ERC2771ContextInternal } from "../../metatx/ERC2771ContextInternal.sol";

abstract contract BilateralTradeInternal is
    IBilateralTradeInternal,
    ERC2771ContextInternal
{
    function _initialize(IRegister register_, address _buyer) internal {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();
        require(
            register_.investorsAllowed(_msgSender()) ||
                register_.isBnD(_msgSender()),
            "Sender must be a valid investor"
        );

        require(
            register_.investorsAllowed(_buyer),
            "Buyer must be a valid investor"
        );

        l.register = register_;
        l.sellerAccount = _msgSender();
        l.details.buyer = _buyer;
        l.status = TradeStatus.Draft;
        emit NotifyTrade(_msgSender(), _buyer, l.status, 0);
    }

    function _register() internal view returns (IRegister) {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();
        return l.register;
    }

    function _status() internal view returns (TradeStatus) {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();

        return l.status;
    }

    function _paymentID() internal view returns (bytes8) {
        uint64 low = uint64(uint160(address(this)));

        return bytes8(low);
    }

    function _getDetails() internal view returns (TradeDetail memory) {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();

        return l.details;
    }

    function _sellerAccount() internal view returns (address) {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();

        return l.sellerAccount;
    }

    function _buyerAccount() internal view returns (address) {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();

        return l.details.buyer;
    }

    function _setDetails(TradeDetail memory _details) internal {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();
        require(
            _msgSender() == l.sellerAccount,
            "Only the seller can update this trade"
        );
        require(
            l.status == TradeStatus.Draft,
            "Cannot change the trade details unless in draft status"
        );
        require(
            l.register.investorsAllowed(_details.buyer),
            "Buyer must be a valid investor even on changing details"
        );

        l.details = _details;
        // an event needs to be generated to enable the back end to know that the trade has been changed
        emit NotifyTrade(
            l.sellerAccount,
            _details.buyer,
            l.status,
            _details.quantity
        );
    }

    function _approve() internal returns (TradeStatus) {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();

        if (_msgSender() == l.sellerAccount && l.status == TradeStatus.Draft) {
            require(l.details.quantity > 0, "quantity not defined");

            require(l.details.tradeDate > 0, "trade date not defined");

            // Remove the control because it is functionally possible to need to create a back value trade
            // But add the control that the value is defined
            require(l.details.valueDate > 0, "value date not defined");

            l.status = TradeStatus.Pending;

            emit NotifyTrade(
                l.sellerAccount,
                l.details.buyer,
                l.status,
                l.details.quantity
            );

            return (l.status);
        }

        if (
            _msgSender() == l.details.buyer && l.status == TradeStatus.Pending
        ) {
            l.status = TradeStatus.Accepted;

            emit NotifyTrade(
                l.sellerAccount,
                l.details.buyer,
                l.status,
                l.details.quantity
            );

            return (l.status);
        }

        require(false, "the trade cannot be approved in this current status");

        return (l.status);
    }

    function _reject() internal {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();

        require(l.status != TradeStatus.Rejected, "Trade already rejected");

        // seller can cancel the trade at any active state before the trade is executed
        if (
            _msgSender() == l.sellerAccount &&
            (l.status != TradeStatus.Executed)
        ) {
            l.status = TradeStatus.Rejected;

            emit NotifyTrade(
                l.sellerAccount,
                l.details.buyer,
                l.status,
                l.details.quantity
            );

            return;
        }

        // buyer can cancel the trade when pending validation on his side or even after he has accepted the trade (but not when the seller prepares the trade (DRAFT))
        if (
            _msgSender() == l.details.buyer &&
            (l.status == TradeStatus.Pending ||
                l.status == TradeStatus.Accepted)
        ) {
            l.status = TradeStatus.Rejected;

            emit NotifyTrade(
                l.sellerAccount,
                l.details.buyer,
                l.status,
                l.details.quantity
            );

            return;
        }

        require(false, "the trade cannot be rejected in this current status");
    }

    function _executeTransfer() internal returns (bool) {
        BilateralTradeStorage.Layout storage l = BilateralTradeStorage.layout();

        require(
            _msgSender() == l.sellerAccount,
            "Only the seller can confirm the payment on this trade"
        );

        require(
            l.status == TradeStatus.Accepted,
            "The trade must be accepted by the buyer before"
        );

        l.status = TradeStatus.Executed;

        // Actually make the transfer now
        bool success = l.register.transferFrom(
            l.sellerAccount,
            l.details.buyer,
            l.details.quantity
        );

        require(success, "the transfer has failed");

        emit NotifyTrade(
            l.sellerAccount,
            l.details.buyer,
            l.status,
            l.details.quantity
        );

        return true;
    }
}
