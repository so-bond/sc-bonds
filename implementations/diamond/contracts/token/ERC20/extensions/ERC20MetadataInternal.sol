// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC20MetadataInternal } from "./IERC20MetadataInternal.sol";
import { ERC20MetadataStorage } from "./ERC20MetadataStorage.sol";
import { Initializable } from "../../../initializable/Initializable.sol";

/**
 * @title ERC20Metadata internal functions
 */
abstract contract ERC20MetadataInternal is
    IERC20MetadataInternal,
    Initializable
{
    function __init__ERC20MetadataInternal(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_
    ) internal initializer {
        __init_ERC20MetadataInternal_unchained(name_, symbol_, decimals_);
    }

    function __init_ERC20MetadataInternal_unchained(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_
    ) internal initializer {
        ERC20MetadataStorage.Layout storage l = ERC20MetadataStorage.layout();

        l.name = name_;
        l.symbol = symbol_;
        l.decimals = decimals_;
    }

    /**
     * @notice return token name
     * @return token name
     */
    function _name() internal view virtual returns (string memory) {
        return ERC20MetadataStorage.layout().name;
    }

    /**
     * @notice return token symbol
     * @return token symbol
     */
    function _symbol() internal view virtual returns (string memory) {
        return ERC20MetadataStorage.layout().symbol;
    }

    /**
     * @notice return token decimals, generally used only for display purposes
     * @return token decimals
     */
    function _decimals() internal view virtual returns (uint8) {
        return ERC20MetadataStorage.layout().decimals;
    }
}
