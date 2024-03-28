// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC2771Context } from "./IERC2771Context.sol";
import { ERC2771ContextInternal } from "./ERC2771ContextInternal.sol";

contract ERC2771Context is IERC2771Context, ERC2771ContextInternal {
    // constructor(address trustedForwarder_) {
    //     _trustedForwarder = trustedForwarder_;
    // }

    /**
     * @inheritdoc IERC2771Context
     */
    function trustedForwarder() public view virtual returns (address) {
        return _trustedForwarder;
    }

    /**
     * @inheritdoc IERC2771Context
     */
    function isTrustedForwarder(
        address forwarder
    ) public view virtual returns (bool) {
        return _isTrustedForwarder(forwarder);
    }
}
