// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC20BurnableInternal } from "./IERC20BurnableInternal.sol";

/**
 * @title ERC20 burnable interface
 */
interface IERC20Burnable is IERC20BurnableInternal {
    /**
     * @notice Destroys `amount` tokens from the caller.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) external;

    /**
     * @notice Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     * @param account The address whose tokens will be burnt.
     * @param amount The amount of tokens to burn.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     */
    function burnFrom(address account, uint256 amount) external;
}
