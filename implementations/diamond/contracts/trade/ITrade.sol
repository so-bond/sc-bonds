// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegister } from "../register/IRegister.sol";
import { ITradeInternal } from "./ITradeInternal.sol";

interface ITrade is ITradeInternal {
    /**
     * @notice Return register contract
     * @return register contract
     */
    function register() external view returns (IRegister);

    /**
     * @notice Return trade status
     * @return trade status
     */
    function status() external view returns (TradeStatus);

    /**
     * @notice Return payment ID
     * @return payment ID
     */
    function paymentID() external view returns (bytes8);

    /**
     * @notice Return trade details
     * @return trade details
     */
    function getDetails() external view returns (TradeDetail memory);

    /**
     * @notice Return seller account
     * @return seller account
     */
    function sellerAccount() external view returns (address);

    /**
     * @notice Return buyer account
     * @return buyer account
     */
    function buyerAccount() external view returns (address);
}
