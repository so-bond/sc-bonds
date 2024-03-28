// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IReentrancyGuardInternal } from "./IReentrancyGuardInternal.sol";
import { ReentrancyGuardStorage } from "./ReentrancyGuardStorage.sol";
import { InitializableInternal } from "../initializable/InitializableInternal.sol";

/**
 * @title Internal functions for ReeantrancyGuard security control module.
 */
abstract contract ReentrancyGuardInternal is
    IReentrancyGuardInternal,
    InitializableInternal
{
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _ENTERED = 2;
    uint256 private constant _NOT_ENTERED = 1;

    function __ReentrancyGuard_init() internal onlyInitializing {
        __ReentrancyGuard_init_unchained();
    }

    function __ReentrancyGuard_init_unchained() internal onlyInitializing {
        ReentrancyGuardStorage.Layout storage l = ReentrancyGuardStorage
            .layout();
        l.status = _NOT_ENTERED;
    }

    modifier nonReentrant() virtual {
        // On the first call to nonReentrant, status will be 0
        if (_isReentrancyGuardLocked()) {
            revert ReentrancyGuard__ReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _lockReentrancyGuard();

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _unlockReentrancyGuard();
    }

    /**
     * @dev returns true if the reentrancy guard is locked, false otherwise
     */
    function _isReentrancyGuardLocked() internal view virtual returns (bool) {
        return ReentrancyGuardStorage.layout().status == _ENTERED;
    }

    /**
     * @dev lock functions that used the nonReentrant modifier
     */
    function _lockReentrancyGuard() internal virtual {
        ReentrancyGuardStorage.layout().status = _ENTERED;
    }

    /**
     * @dev unlock functions used the nonReentrant modifier
     */
    function _unlockReentrancyGuard() internal virtual {
        ReentrancyGuardStorage.layout().status = _NOT_ENTERED;
    }
}
