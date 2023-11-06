// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC20 } from "../IERC20.sol";
import { IERC20BaseInternal } from "./IERC20BaseInternal.sol";

/**
 * @title Base ERC20 interface
 */
interface IERC20Base is IERC20, IERC20BaseInternal {

}
