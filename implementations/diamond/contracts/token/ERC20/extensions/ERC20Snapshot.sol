// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC20Snapshot } from "./IERC20Snapshot.sol";
import { ERC20SnapshotInternal } from "./ERC20SnapshotInternal.sol";

/**
 * @title ERC20 base implementation with support for token balance and supply snapshots
 */
abstract contract ERC20Snapshot is IERC20Snapshot, ERC20SnapshotInternal {
    /// @inheritdoc IERC20Snapshot
    function balanceOfAt(
        address account,
        uint256 snapshotId
    ) public view returns (uint256) {
        return _balanceOfAt(account, snapshotId);
    }

    /// @inheritdoc IERC20Snapshot
    function totalSupplyAt(uint256 snapshotId) public view returns (uint256) {
        return _totalSupplyAt(snapshotId);
    }
}
