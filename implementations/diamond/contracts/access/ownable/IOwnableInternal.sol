// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC173Internal } from "./IERC173Internal.sol";

interface IOwnableInternal is IERC173Internal {
    error Ownable__NotOwner();
    error Ownable__NotTransitiveOwner();
}
