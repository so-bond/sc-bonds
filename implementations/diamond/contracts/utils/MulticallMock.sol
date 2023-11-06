// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import "./Multicall.sol";

contract MulticallMock is Multicall {
    function callTest() external pure returns (uint256) {
        return 1;
    }

    function callRevertTest() external pure {
        revert("revert");
    }
}
