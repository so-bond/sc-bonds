// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { ITrade } from "../ITrade.sol";

interface IBilateralTrade is ITrade {
    /**
     * @notice Set trade details
     * @param _details trade details
     */
    function setDetails(TradeDetail memory _details) external;

    /**
     * @notice Approve trade
     * @return trade status
     */
    function approve() external returns (Status);

    /**
     * @notice Reject trade
     */
    function reject() external;

    /**
     * @notice Execute transfer
     * @return true if transfer was successful
     */
    function executeTransfer() external returns (bool);
}
