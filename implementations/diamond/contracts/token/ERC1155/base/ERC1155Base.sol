// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC1155 } from "../IERC1155.sol";
import { IERC1155Base } from "./IERC1155Base.sol";
import { IERC1155Receiver } from "../IERC1155Receiver.sol";
import { ERC1155BaseInternal } from "./ERC1155BaseInternal.sol";
import { ERC2771ContextInternal } from "../../../metatx/ERC2771ContextInternal.sol";

/**
 * @title Base ERC1155 contract
 * @dev derived from https://github.com/OpenZeppelin/openzeppelin-contracts/ (MIT license)
 * @dev inheritor must either implement ERC165 supportsInterface or inherit ERC165Base
 */
abstract contract ERC1155Base is
    IERC1155Base,
    ERC2771ContextInternal,
    ERC1155BaseInternal
{
    /**
     * @inheritdoc IERC1155
     */
    function balanceOf(
        address account,
        uint256 id
    ) public view virtual returns (uint256) {
        return _balanceOf(account, id);
    }

    /**
     * @inheritdoc IERC1155
     */
    function balanceOfBatch(
        address[] memory accounts,
        uint256[] memory ids
    ) public view virtual returns (uint256[] memory) {
        return _balanceOfBatch(accounts, ids);
    }

    /**
     * @inheritdoc IERC1155
     */
    function isApprovedForAll(
        address account,
        address operator
    ) public view virtual returns (bool) {
        return _isApprovedForAll(account, operator);
    }

    /**
     * @inheritdoc IERC1155
     */
    function setApprovalForAll(address operator, bool status) public virtual {
        _setApprovalForAll(operator, status);
    }

    /**
     * @inheritdoc IERC1155
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual {
        if (from != _msgSender() && !isApprovedForAll(from, _msgSender()))
            revert ERC1155Base__NotOwnerOrApproved();
        _safeTransfer(_msgSender(), from, to, id, amount, data);
    }

    /**
     * @inheritdoc IERC1155
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual {
        if (from != _msgSender() && !isApprovedForAll(from, _msgSender()))
            revert ERC1155Base__NotOwnerOrApproved();
        _safeTransferBatch(_msgSender(), from, to, ids, amounts, data);
    }
}
