// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegister } from "../IRegister.sol";
import { ICouponSnapshotManagement } from "./ICouponSnapshotManagement.sol";
import { ICouponInternal } from "./ICouponInternal.sol";

library CouponStorage {
    struct Layout {
        uint256 couponDate;
        uint256 nbDays;
        uint256 recordDate;
        uint256 cutOfTime;
        address payingAgent;
        uint256 actualTimestamp; // initialized at time of recording in the register
        // IRegister register;
        // ICouponSnapshotManagement register2;
        ICouponInternal.CouponStatus status;
        //TODO: struct {PaymentStatus ; PaymentID}
        mapping(address => ICouponInternal.PaymentStatus) investorPayments;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("cacib.contracts.storage.Coupon");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
