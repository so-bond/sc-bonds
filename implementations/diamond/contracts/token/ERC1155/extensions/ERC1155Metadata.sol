// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC1155Metadata } from "./IERC1155Metadata.sol";
import { ERC1155MetadataInternal } from "./ERC1155MetadataInternal.sol";

/**
 * @title ERC1155 metadata extensions
 */
abstract contract ERC1155Metadata is IERC1155Metadata, ERC1155MetadataInternal {
    /**
     * @notice inheritdoc IERC1155Metadata
     */
    function uri(uint256 tokenId) public view virtual returns (string memory) {
        return _uri(tokenId);
    }
}
