// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { ERC2771Context } from "../metatx/ERC2771Context.sol";
import { Initializable } from "../initializable/Initializable.sol";
import { ReentrancyGuard } from "../security/ReentrancyGuard.sol";

abstract contract PackageInternal is
    Initializable,
    ReentrancyGuard,
    ERC2771Context
{
    function __Package_init() internal initializer {
        __Package_init_unchained();
        __ReentrancyGuard_init();
        __ERC2771Context_init();
    }

    function __Package_init_unchained() internal initializer {}
}
