// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IPausableInternal } from "./IPausableInternal.sol";
import { PausableStorage } from "./PausableStorage.sol";
import { ERC2771ContextInternal } from "../metatx/ERC2771ContextInternal.sol";

/**
 * @title Internal functions for Pausable security control module.
 */
abstract contract PausableInternal is
    IPausableInternal,
    ERC2771ContextInternal
{
    modifier whenPaused() {
        if (!_paused()) {
            revert Pausable__NotPaused();
        }
        _;
    }

    modifier whenNotPaused() {
        if (_paused()) {
            revert Pausable__Paused();
        }
        _;
    }

    /**
     * @notice query whether contract is paused
     * @return status whether contract is paused
     */
    function _paused() internal view virtual returns (bool status) {
        status = PausableStorage.layout().paused;
    }

    /**
     * @notice Triggers paused state, when contract is unpaused.
     */
    function _pause() internal virtual whenNotPaused {
        PausableStorage.layout().paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @notice Triggers unpaused state, when contract is paused.
     */
    function _unpause() internal virtual whenPaused {
        delete PausableStorage.layout().paused;
        emit Unpaused(_msgSender());
    }
}
