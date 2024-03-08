// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { ICouponSnapshotManagementInternal } from "./ICouponSnapshotManagementInternal.sol";

library CouponSnapshotManagementStorage {
    struct Layout {
        uint256 currentSnapshotTimestamp; // Represents the datetime (in sec) of the next time a snap shot should be taken if a transfer or a coupon date setting is done after that moment
        uint256 nextSnapshotTimestamp; // represents the following time for a snapshot when the current one is reached
        uint256 currentCouponDate; //the date part of _currentSnapshotTimestamp : needed to populate the 'couponDateSnapshotId' map when a new snapshotId is created
        bool forceAcceptNextTransfer; // should always be reset to false
        mapping(uint256 => uint256) couponDateSnapshotId; // couponDate => SnnapshotId
        mapping(address => uint256) amountLocked; // locked tokens
        mapping(bytes32 => ICouponSnapshotManagementInternal.Lock) locks; // locked tokens
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("sobond.contracts.storage.CouponSnapshotManagement");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
