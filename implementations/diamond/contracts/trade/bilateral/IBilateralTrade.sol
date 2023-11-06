// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { ITrade } from "../ITrade.sol";
import { IBilateralTradeInternal } from "./IBilateralTradeInternal.sol";

interface IBilateralTrade is IBilateralTradeInternal, ITrade {
    /**
     * @notice Set trade details
     * @param _details trade details
     */
    function setDetails(TradeDetail memory _details) external;

    /**
     * @notice Approve trade
     * @return trade status
     */
    function approve() external returns (TradeStatus);

    /**
     * @notice Reject trade
     */
    function reject() external; // TODO add return value

    /**
     * @notice Execute transfer
     * @return true if transfer was successful
     */
    function executeTransfer() external returns (bool);
}
