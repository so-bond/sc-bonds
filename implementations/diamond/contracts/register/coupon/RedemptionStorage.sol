// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { ICoupon } from "./ICoupon.sol";

library RedemptionStorage {
    struct Layout {
        mapping(address => ICoupon.PaymentStatus) investorRedemptionPayments;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("cacib.contracts.storage.Redemption");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
