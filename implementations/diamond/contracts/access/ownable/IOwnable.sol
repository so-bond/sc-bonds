// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC173 } from "./IERC173.sol";
import { IOwnableInternal } from "./IOwnableInternal.sol";

interface IOwnable is IERC173, IOwnableInternal {
    /**
     * @notice Leaves the contract without owner. It will not be possible to call
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() external;
}
