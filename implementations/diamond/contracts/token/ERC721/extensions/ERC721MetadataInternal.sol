// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC721MetadataInternal } from "./IERC721MetadataInternal.sol";
import { ERC721BaseInternal } from "../base/ERC721Base.sol";
import { ERC721MetadataStorage } from "./ERC721MetadataStorage.sol";
import { UintUtils } from "../../../utils/UintUtils.sol";

/**
 * @title ERC721Metadata internal functions
 */
abstract contract ERC721MetadataInternal is
    IERC721MetadataInternal,
    ERC721BaseInternal
{
    using UintUtils for uint256;

    /**
     * @notice get token name
     * @return token name
     */
    function _name() internal view virtual returns (string memory) {
        return ERC721MetadataStorage.layout().name;
    }

    /**
     * @notice get token symbol
     * @return token symbol
     */
    function _symbol() internal view virtual returns (string memory) {
        return ERC721MetadataStorage.layout().symbol;
    }

    /**
     * @notice get generated URI for given token
     * @return token URI
     */
    function _tokenURI(
        uint256 tokenId
    ) internal view virtual returns (string memory) {
        if (!_exists(tokenId)) revert ERC721Metadata__NonExistentToken();

        ERC721MetadataStorage.Layout storage l = ERC721MetadataStorage.layout();

        string memory tokenIdURI = l.tokenURIs[tokenId];
        string memory baseURI = l.baseURI;

        if (bytes(baseURI).length == 0) {
            return tokenIdURI;
        } else if (bytes(tokenIdURI).length > 0) {
            return string(abi.encodePacked(baseURI, tokenIdURI));
        } else {
            return string(abi.encodePacked(baseURI, tokenId.toString()));
        }
    }

    /**
     * @notice ERC721 hook: clear per-token URI data on burn
     * @inheritdoc ERC721BaseInternal
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (to == address(0)) {
            delete ERC721MetadataStorage.layout().tokenURIs[tokenId];
        }
    }
}
