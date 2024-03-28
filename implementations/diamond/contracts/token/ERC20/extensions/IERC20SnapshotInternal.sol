// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

/**
 * @title ERC20 snapshot internal interface
 */
interface IERC20SnapshotInternal {
    error ERC20Snapshot__SnapshotIdDoesNotExists();
    error ERC20Snapshot__SnapshotIdIsZero();

    /**
     * @dev Emitted by {_snapshot} when a snapshot identified by `id` is created.
     */
    event Snapshot(uint256 id);
}
