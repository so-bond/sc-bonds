// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegister } from "../IRegister.sol";

interface ICouponInternal {
    enum CouponStatus {
        Draft,
        Ready,
        Cancelled,
        Closed,
        Finalized
    }

    /*
     * ToBePaid: to be paid by the paying agent
     * Paid: when coupon paid by the paying agent
     * PaymentReceived: when payment received by the custodian
     */
    enum PaymentStatus {
        ToBePaid,
        Paid,
        PaymentReceived
    }

    event CouponChanged(
        // IRegister indexed register,
        uint256 indexed couponDate,
        CouponStatus indexed status
    );

    event CouponPaymentStatusChanged(
        // IRegister indexed register,
        uint256 indexed couponDate,
        address indexed investor,
        PaymentStatus status,
        PaymentStatus previousStatus
    );
}
