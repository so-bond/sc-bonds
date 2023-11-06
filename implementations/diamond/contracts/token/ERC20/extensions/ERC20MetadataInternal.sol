// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC20MetadataInternal } from "./IERC20MetadataInternal.sol";
import { ERC20MetadataStorage } from "./ERC20MetadataStorage.sol";
import { PackageInternal } from "../../../package/PackageInternal.sol";

/**
 * @title ERC20Metadata internal functions
 */
abstract contract ERC20MetadataInternal is
    IERC20MetadataInternal,
    PackageInternal
{
    function __init__ERC20MetadataInternal(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_
    ) internal initializer {
        __init_ERC20MetadataInternal_unchained(name_, symbol_, decimals_);
        __Package_init();
    }

    function __init_ERC20MetadataInternal_unchained(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_
    ) internal initializer {
        _setName(name_);
        _setSymbol(symbol_);
        _setDecimals(decimals_);
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

    function _setName(string memory name) internal virtual {
        ERC20MetadataStorage.layout().name = name;
    }

    function _setSymbol(string memory symbol) internal virtual {
        ERC20MetadataStorage.layout().symbol = symbol;
    }

    function _setDecimals(uint8 decimals) internal virtual {
        ERC20MetadataStorage.layout().decimals = decimals;
    }
}
