// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { ICouponInternal } from "./ICouponInternal.sol";
import { IRegister } from "../IRegister.sol";

interface IRedemptionInternal is ICouponInternal {
    event RedemptionPaymentStatusChanged(
        // IRegister indexed register,
        uint256 indexed couponDate,
        address indexed investor,
        PaymentStatus status,
        PaymentStatus previousStatus
    );

    event RedemptionChanged(
        IRegister indexed register,
        uint256 indexed couponDate,
        CouponStatus indexed status
    );
}
