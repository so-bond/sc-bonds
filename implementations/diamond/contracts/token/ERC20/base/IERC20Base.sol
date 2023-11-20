// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC20 } from "../IERC20.sol";
import { IERC20BaseInternal } from "./IERC20BaseInternal.sol";

/**
 * @title Base ERC20 interface
 */
interface IERC20Base is IERC20, IERC20BaseInternal {
    /**
     * @notice Increase the allowance granted from given holder to given spender
     * @param spender recipient of allowance
     * @param addedValue quantity of tokens approved for spending
     */
    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) external returns (bool);

    /**
     * @notice Decrease the allowance granted from given holder to given spender
     * @param spender recipient of allowance
     * @param subtractedValue quantity of tokens approved for spending
     */
    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) external returns (bool);
}
