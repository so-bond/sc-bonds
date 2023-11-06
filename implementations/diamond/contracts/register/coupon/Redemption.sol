// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRedemption } from "./IRedemption.sol";
import { RedemptionInternal } from "./RedemptionInternal.sol";

contract Redemption is IRedemption, RedemptionInternal {
    /// @inheritdoc IRedemption
    function investorRedemptionPayments(
        address _investor
    ) public view returns (PaymentStatus) {
        return _investorRedemptionPayments(_investor);
    }

    /// @inheritdoc IRedemption
    function getMaturityAmountForInvestor(
        address _investor
    ) public view returns (uint256 paymentAmount) {
        return _getMaturityAmountForInvestor(_investor);
    }

    /// @inheritdoc IRedemption
    function getTotalMaturityAmount()
        public
        view
        returns (uint256 paymentAmount)
    {
        return _getTotalMaturityAmount();
    }

    /// @inheritdoc IRedemption
    function getInvestorRedemptionPayments(
        address _investor
    ) public view returns (PaymentStatus) {
        return _getInvestorRedemptionPayments(_investor);
    }

    /// @inheritdoc IRedemption
    function toggleRedemptionPayment(address _investor) public {
        _toggleRedemptionPayment(_investor);
    }

    /// @inheritdoc IRedemption
    function paymentIdRedemptionForInvest(
        address _investor
    ) external view returns (bytes8) {
        return _paymentIdRedemptionForInvest(_investor);
    }
}
