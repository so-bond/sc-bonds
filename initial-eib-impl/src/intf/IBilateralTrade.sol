// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "./ITrade.sol";

interface IBilateralTrade is ITrade {
  function setDetails(TradeDetail memory _details) external;
  function approve() external returns (Status); 
  function reject() external;
  function executeTransfer() external returns(bool);
 
}

