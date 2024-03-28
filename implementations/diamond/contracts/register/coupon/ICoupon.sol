// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

// import { ICouponInternal } from "./ICouponInternal.sol";
import { IRegister } from "../IRegister.sol";

interface ICoupon {
    /**
     * @notice The coupon status
     * @dev Draft: coupon not yet ready
     * @dev Ready: coupon ready to be paid
     * @dev Cancelled: coupon cancelled by the paying agent
     * @dev Closed: coupon paid by the paying agent
     * @dev Finalized: coupon payment received by the custodian
     */
    enum CouponStatus {
        Draft,
        Ready,
        Cancelled,
        Closed,
        Finalized
    }

    /**
     * @notice The payment status
     * @dev ToBePaid: to be paid by the paying agent
     * @dev Paid: when coupon paid by the paying agent
     * @dev PaymentReceived: when payment received by the custodian
     */
    enum PaymentStatus {
        ToBePaid,
        Paid,
        PaymentReceived
    }

    /**
     * @notice Emitted when the coupon status is changed
     * @param register The register address
     * @param couponDate The coupon date
     * @param status The payment status
     */
    event CouponChanged(
        IRegister indexed register,
        uint256 indexed couponDate,
        CouponStatus indexed status
    );

    /**
     * @notice Emitted when the payment status is changed
     * @param register The register address
     * @param couponDate The coupon date
     * @param investor The investor address
     * @param status The payment status
     * @param previousStatus The previous payment status
     */
    event CouponPaymentStatusChanged(
        IRegister indexed register,
        uint256 indexed couponDate,
        address indexed investor,
        PaymentStatus status,
        PaymentStatus previousStatus
    );

    /**
     * @notice Get the coupon status
     * @return status The coupon status
     */
    function couponDate() external view returns (uint256);

    /**
     * @notice Get the number of days
     * @return nbDays The number of days
     */
    function nbDays() external view returns (uint256);

    /**
     * @notice Get the record date
     * @return recordDate The record date
     */
    function recordDate() external view returns (uint256);

    /**
     * @notice Get the cut of time
     * @return cutOfTime The cut of time
     */
    function cutOfTime() external view returns (uint256);

    /**
     * @notice Get the paying agent
     * @return payingAgent The paying agent
     */
    function payingAgent() external view returns (address);

    /**
     * @notice Get the investor payment status
     * @param _investor The investor address
     * @return status The payment status
     */
    function getInvestorPayments(
        address _investor
    ) external view returns (PaymentStatus);

    /**
     * @notice Get the payment ID for an investor
     * @param _investor The investor address
     * @return paymentId The payment ID
     */
    function paymentIdForInvest(
        address _investor
    ) external view returns (bytes8);

    /**
     * @notice Set the date as current coupon
     */
    function setDateAsCurrentCoupon() external;

    /**
     * @notice Set the number of days
     * @param _nbDays The number of days
     */
    function setNbDays(uint256 _nbDays) external;

    /**
     * @notice Set the cut of time
     * @param _recordDate The record date
     * @param _cutOfTime The cut of time
     */
    function setCutOffTime(uint256 _recordDate, uint256 _cutOfTime) external;

    /**
     * @notice Reject the coupon
     */
    function rejectCoupon() external;

    /**
     * @notice Get the payment amount for an investor
     * @param _investor The investor address
     * @return paymentAmount The amount of payment
     */
    function getPaymentAmountForInvestor(
        address _investor
    ) external view returns (uint256 paymentAmount);

    /**
     * @notice Get the total payment amount
     * @return paymentAmount The amount of payment
     */
    function getTotalPaymentAmount()
        external
        view
        returns (uint256 paymentAmount);

    /**
     * @notice Toggle the coupon payment for an investor
     * @param _investor The investor address
     */
    function toggleCouponPayment(address _investor) external;
}
