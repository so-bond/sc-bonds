// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC20Burnable } from "./IERC20Burnable.sol";
import { ERC20BurnableInternal } from "./ERC20BurnableInternal.sol";

/**
 * @title Extension of {ERC20} that allows users or approved operators to burn tokens.
 */
abstract contract ERC20Burnable is IERC20Burnable, ERC20BurnableInternal {
    /// @inheritdoc IERC20Burnable
    function burn(uint256 amount) public virtual {
        _burn(_msgSender(), amount);
    }

    /// @inheritdoc IERC20Burnable
    function burnFrom(address account, uint256 amount) public virtual {
        _burnFrom(account, amount);
    }
}
