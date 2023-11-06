// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { IOwnable } from "../access/ownable/IOwnable.sol";
import { IERC165 } from "../introspection/IERC165.sol";
import { IDiamondBase } from "./base/IDiamondBase.sol";
import { IDiamondFallback } from "./fallback/IDiamondFallback.sol";
import { IDiamondLoupe } from "./loupe/IDiamondLoupe.sol";
import { IDiamondCut } from "./cut/IDiamondCut.sol";

interface IDiamond is
    IDiamondBase,
    IDiamondFallback,
    IDiamondLoupe,
    IDiamondCut,
    IOwnable,
    IERC165
{}
