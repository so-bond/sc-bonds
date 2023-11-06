// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC165 } from "./IERC165.sol";
import { ERC165Internal } from "./ERC165Internal.sol";

contract ERC165 is IERC165, ERC165Internal {
    // @inheritdoc IERC165
    function supportsInterface(
        bytes4 interfaceId
    ) external view returns (bool) {
        return _supportedInterface(interfaceId);
    }
}
