// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRedemptionInternal } from "./IRedemptionInternal.sol";
import { ICoupon } from "./ICoupon.sol";

interface IRedemption is IRedemptionInternal, ICoupon {
    /** @notice Get the maturity amount for an investor
     * @param _investor The investor address
     * @return paymentAmount The maturity amount
     */
    function investorRedemptionPayments(
        address _investor
    ) external view returns (PaymentStatus);

    /** @notice Get the maturity amount for an investor
     * @param _investor The investor address
     * @return paymentAmount The maturity amount
     */
    function getMaturityAmountForInvestor(
        address _investor
    ) external view returns (uint256 paymentAmount);

    /** @notice Get the total maturity amount
     * @return paymentAmount The maturity amount
     */
    function getTotalMaturityAmount()
        external
        view
        returns (uint256 paymentAmount);

    /** @notice Get the redemption payment status for an investor
     * @param _investor The investor address
     * @return status The payment status
     */
    function getInvestorRedemptionPayments(
        address _investor
    ) external view returns (PaymentStatus);

    /** @notice Activate the redemption payment for an investor
     * @param _investor The investor address
     */
    function toggleRedemptionPayment(address _investor) external;

    /** @notice  Get the payment id for an investor
     * @param _investor The investor address
     * @return paymentId The payment id
     */
    function paymentIdRedemptionForInvest(
        address _investor
    ) external view returns (bytes8);
}
