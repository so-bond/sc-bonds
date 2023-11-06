// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { ICoupon } from "./ICoupon.sol";
import { CouponInternal } from "./CouponInternal.sol";

contract Coupon is ICoupon, CouponInternal {
    /// @inheritdoc ICoupon
    function couponDate() public view returns (uint256) {
        return _couponDate();
    }

    /// @inheritdoc ICoupon
    function nbDays() public view returns (uint256) {
        return _nbDays();
    }

    /// @inheritdoc ICoupon
    function recordDate() public view returns (uint256) {
        return _recordDate();
    }

    /// @inheritdoc ICoupon
    function cutOfTime() public view returns (uint256) {
        return _cutOfTime();
    }

    /// @inheritdoc ICoupon
    function payingAgent() public view returns (address) {
        return _payingAgent();
    }

    /// @inheritdoc ICoupon
    function getInvestorPayments(
        address _investor
    ) public view returns (PaymentStatus) {
        return _getInvestorPayments(_investor);
    }

    /// @inheritdoc ICoupon
    function paymentIdForInvest(
        address _investor
    ) external view returns (bytes8) {
        return _paymentIdForInvest(_investor);
    }

    /// @inheritdoc ICoupon
    function setDateAsCurrentCoupon() public {
        _setDateAsCurrentCoupon();
    }

    /// @inheritdoc ICoupon
    function setNbDays(uint256 nbDays_) public {
        _setNbDays(nbDays_);
    }

    /// @inheritdoc ICoupon
    function setCutOffTime(uint256 recordDate_, uint256 cutOfTime_) public {
        _setCutOffTime(recordDate_, cutOfTime_);
    }

    /// @inheritdoc ICoupon
    function rejectCoupon() public {
        _rejectCoupon();
    }

    /// @inheritdoc ICoupon
    function getPaymentAmountForInvestor(
        address _investor
    ) public view returns (uint256 paymentAmount) {
        paymentAmount = _getPaymentAmountForInvestor(_investor);
    }

    /// @inheritdoc ICoupon
    function getTotalPaymentAmount()
        public
        view
        returns (uint256 paymentAmount)
    {
        paymentAmount = _getTotalPaymentAmount();
    }

    /// @inheritdoc ICoupon
    function toggleCouponPayment(address _investor) public {
        _toggleCouponPayment(_investor);
    }
}
