// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC1155 } from "../IERC1155.sol";
import { IERC1155BaseInternal } from "./IERC1155BaseInternal.sol";

/**
 * @title ERC1155 base interface
 */
interface IERC1155Base is IERC1155BaseInternal, IERC1155 {

}
