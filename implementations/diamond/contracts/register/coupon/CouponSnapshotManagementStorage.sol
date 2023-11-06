// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

library CouponSnapshotManagementStorage {
    struct Layout {
        mapping(uint256 => uint256) couponDateSnapshotId; // couponDate => SnnapshotId
        uint256 _currentSnapshotTimestamp; // Represents the datetime (in sec) of the next time a snap shot should be taken if a transfer or a coupon date setting is done after that moment
        uint256 _nextSnapshotTimestamp; // represents the following time for a snapshot when the current one is reached
        uint256 _currentCouponDate; //the date part of _currentSnapshotTimestamp : needed to populate the 'couponDateSnapshotId' map when a new snapshotId is created
        bool _forceAcceptNextTransfer; // should always be reset to false
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("cacib.contracts.storage.CouponSnapshotManagement");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
