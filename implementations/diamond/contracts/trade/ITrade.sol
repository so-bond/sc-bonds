// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { IRegister } from "../register/IRegister.sol";

interface ITrade {
    /**
     * @notice Trade status
     * @dev Draft: trade is created
     * @dev Pending: trade is waiting for approval
     * @dev Rejected: trade is rejected
     * @dev Accepted: trade is accepted
     * @dev Executed: trade is executed
     * @dev Paid: trade is paid
     */
    enum Status {
        Draft,
        Pending,
        Rejected,
        Accepted,
        Executed,
        Paid
    }

    /**
     * @notice Trade details
     * @param quantity trade quantity
     * @param buyer buyer account
     * @param tradeDate trade date
     * @param valueDate value date
     * @param price trade price
     */
    struct TradeDetail {
        uint256 quantity;
        address buyer;
        uint256 tradeDate;
        uint256 valueDate;
        uint256 price;
    }

    /**
     * @notice Trade event
     * @param seller seller account
     * @param buyer buyer account
     * @param status trade status
     * @param quantity trade quantity
     */
    event NotifyTrade(
        address indexed seller,
        address indexed buyer,
        Status indexed status,
        uint256 quantity
    );

    /**
     * @notice Return register contract
     * @return register contract
     */
    function register() external view returns (IRegister);

    /**
     * @notice Return trade status
     * @return trade status
     */
    function status() external view returns (Status);

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
