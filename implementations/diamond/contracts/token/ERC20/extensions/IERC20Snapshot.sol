// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC20SnapshotInternal } from "./IERC20SnapshotInternal.sol";
import { IERC20Base } from "../base/IERC20Base.sol";

/**
 * @title ERC20 snapshot interface
 */
interface IERC20Snapshot is IERC20SnapshotInternal, IERC20Base {
    /**
     * @notice Query the token balance of given account at given snapshot id
     * @param account address to query
     * @param snapshotId snapshot id to query
     * @return token balance
     */
    function balanceOfAt(
        address account,
        uint256 snapshotId
    ) external view returns (uint256);

    /**
     * @notice Query the total minted token supply at given snapshot id
     * @param snapshotId snapshot id to query
     * @return token supply
     */
    function totalSupplyAt(uint256 snapshotId) external view returns (uint256);
}
