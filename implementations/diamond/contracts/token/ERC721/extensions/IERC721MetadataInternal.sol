// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC721BaseInternal } from "../base/IERC721BaseInternal.sol";

/**
 * @title ERC721Metadata internal interface
 */
interface IERC721MetadataInternal is IERC721BaseInternal {
    error ERC721Metadata__NonExistentToken();
}
