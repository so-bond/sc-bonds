// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC2771ContextInternal } from "./IERC2771ContextInternal.sol";

interface IERC2771Context is IERC2771ContextInternal {
    /**
     * @notice Returns the address of the trusted forwarder.
     * @return The address of the trusted forwarder.
     */
    function trustedForwarder() external view returns (address);

    /**
     * @notice Indicates whether any particular address is the trusted forwarder.
     * @param forwarder The address being queried.
     * @return True if the address is the trusted forwarder, false otherwise.
     */
    function isTrustedForwarder(address forwarder) external view returns (bool);
}
