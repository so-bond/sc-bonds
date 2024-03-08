// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

interface ICouponSnapshotManagementInternal {
    /**
     * @notice The status of the HTLC.
     * @dev Unlocked: The asset is unlocked.
     * @dev Locked: The Asset is locked.
     * @dev Released: The Asset is released.
     * @dev ForceReleased: The Asset is force released.
     * @dev ForceCancelled: The Asset is force cancelled.
     */
    enum LStatus {
        Unlocked,
        Locked,
        Released,
        Forced,
        Cancelled
    }

    /**
     * @notice The lock information.
     * @dev from: The address of the from.
     * @dev to: The address of the to.
     * @dev registry: The address of the registry.
     * @dev txId: The unique transaction id (e.g. uti).
     * @dev paymentID: The unique payment id (e.g. uetr).
     * @dev hL: The h of the secret which unlocks the contract assets.
     * @dev hR: The h of the forced release.
     * @dev hC: The h of the forced cancel.
     * @dev dDate: The timestamp of when the asset will be released to the to.
     * @dev artifact: The artifacts of the HTLC.
     * @dev status: The status of the HTLC.
     */
    struct Lock {
        address from;
        address to;
        uint256 amount;
        bytes32 txId; // unique transaction id (e.g. uti)
        bytes32 hL; // h of the secret which unlocks the contract
        bytes32 hR; // h of the forced release
        bytes32 hC; // h of the forced cancel
        uint256 pDate; // timestamp of when the payment will be released to the from
        uint256 dDate; // timestamp of when the asset will be released to the to
        bytes32 proof; // artifacts of the HTLC
        LStatus status; // status of the HTLC
    }

    /**
     * @notice The snapshot information.
     * @dev snapshotId: The unique snapshot id.
     * @dev couponDate: The coupon date.
     * @dev timestamp: The timestamp of the snapshot.
     */
    event SnapshotTimestampChange(
        uint256 indexed couponDate,
        uint256 indexed currentTimestamp,
        uint256 indexed nextTimestamp
    );

    /**
     * @notice Event emitted when the asset is locked.
     * @param txId The unique transaction id (e.g. uti).
     * @param from The address of the from.
     * @param to The address of the to.
     * @param hL The h of the secret which unlocks the contract.
     * @param status The status of the HTLC.
     */
    event AssetHTLC(
        bytes32 indexed txId,
        address indexed from,
        address indexed to,
        bytes32 hL,
        LStatus status
    );
}
