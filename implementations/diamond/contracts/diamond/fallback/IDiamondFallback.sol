// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { IDiamondBase } from "../base/IDiamondBase.sol";

interface IDiamondFallback is IDiamondBase {
    /**
     * @notice Query the address of the fallback implementation
     * @return fallbackAddress address of fallback implementation
     */
    function getFallbackAddress()
        external
        view
        returns (address fallbackAddress);

    /**
     * @notice Set the address of the fallback implementation
     * @param fallbackAddress address of fallback implementation
     */
    function setFallbackAddress(address fallbackAddress) external;
}
