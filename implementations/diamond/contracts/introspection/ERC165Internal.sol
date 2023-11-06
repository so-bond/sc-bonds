// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC165Internal } from "./IERC165Internal.sol";
import { ERC165Storage } from "./ERC165Storage.sol";

abstract contract ERC165Internal is IERC165Internal {
    function _supportedInterface(
        bytes4 interfaceId
    ) internal view returns (bool) {
        return ERC165Storage.layout().supportedInterfaces[interfaceId];
    }

    function _setSupportedInterface(bytes4 interfaceId, bool status) internal {
        if (interfaceId == 0xffffffff) revert ERC165Base__InvalidInterfaceId();
        ERC165Storage.layout().supportedInterfaces[interfaceId] = status;
    }
}
