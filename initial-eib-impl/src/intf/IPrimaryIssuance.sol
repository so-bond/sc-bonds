// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "./ITrade.sol";

interface IPrimaryIssuance is ITrade {
  function account() external view returns (address);
  /** as a B&D execute the transfer from the security issuance account to the B&D account. If successfull it will pass the status from Initiated to Completed */
  function validate() external;
  event PrimaryIssuanceCreated(address contractAddress);
}

