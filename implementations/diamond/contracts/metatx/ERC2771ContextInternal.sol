// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC2771ContextInternal } from "./IERC2771ContextInternal.sol";
import { ContextInternal } from "./ContextInternal.sol";

abstract contract ERC2771ContextInternal is
    IERC2771ContextInternal,
    ContextInternal
{
    address internal _trustedForwarder;

    function __ERC2771Context_init() internal onlyInitializing {
        __ERC2771Context_init_unchained();
    }

    function __ERC2771Context_init_unchained() internal onlyInitializing {}

    function _isTrustedForwarder(
        address forwarder
    ) internal view virtual returns (bool) {
        return forwarder == _trustedForwarder;
    }

    /**
     * @dev Override for `msg.sender`. Defaults to the original `msg.sender` whenever
     * a call is not performed by the trusted forwarder or the calldata length is less than
     * 20 bytes (an address length).
     */
    function _msgSender()
        internal
        view
        virtual
        override
        returns (address sender)
    {
        if (_isTrustedForwarder(msg.sender) && msg.data.length >= 20) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    /**
     * @dev Override for `msg.data`. Defaults to the original `msg.data` whenever
     * a call is not performed by the trusted forwarder or the calldata length is less than
     * 20 bytes (an address length).
     */
    function _msgData()
        internal
        view
        virtual
        override
        returns (bytes calldata)
    {
        if (_isTrustedForwarder(msg.sender) && msg.data.length >= 20) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }
}
