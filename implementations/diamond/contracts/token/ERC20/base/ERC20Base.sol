// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC20 } from "../IERC20.sol"; /// @dev this is required to inherit documentation only
import { IERC20Base } from "./IERC20Base.sol";
import { ERC20BaseInternal } from "./ERC20BaseInternal.sol";

// import { ERC2771ContextInternal } from "../../../metatx/ERC2771ContextInternal.sol";

/**
 * @title Base ERC20 implementation, excluding optional extensions
 */
abstract contract ERC20Base is IERC20Base, ERC20BaseInternal {
    /// @inheritdoc IERC20
    function totalSupply() external view virtual returns (uint256) {
        return _totalSupply();
    }

    ///  @inheritdoc IERC20
    function balanceOf(
        address account
    ) external view virtual returns (uint256) {
        return _balanceOf(account);
    }

    ///  @inheritdoc IERC20
    function allowance(
        address holder,
        address spender
    ) external view virtual returns (uint256) {
        return _allowance(holder, spender);
    }

    ///  @inheritdoc IERC20
    function approve(
        address spender,
        uint256 amount
    ) external virtual returns (bool) {
        return _approve(_msgSender(), spender, amount);
    }

    ///  @inheritdoc IERC20
    function transfer(
        address recipient,
        uint256 amount
    ) external virtual returns (bool) {
        return _transfer(_msgSender(), recipient, amount);
    }

    ///  @inheritdoc IERC20
    function transferFrom(
        address holder,
        address recipient,
        uint256 amount
    ) external virtual returns (bool) {
        return _transferFrom(holder, recipient, amount);
    }

    /**
     * @inheritdoc IERC20Base
     */
    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) public virtual returns (bool) {
        return _increaseAllowance(spender, addedValue);
    }

    /**
     * @inheritdoc IERC20Base
     */
    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) public virtual returns (bool) {
        return _decreaseAllowance(spender, subtractedValue);
    }
}
