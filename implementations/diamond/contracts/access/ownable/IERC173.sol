// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC173Internal } from "./IERC173Internal.sol";

/**  @title ERC-173 Contract Ownership Standard
 * Note: the ERC-165 identifier for this interface is 0x7f5828d0
 */
interface IERC173 is IERC173Internal {
    /**
     * @notice Get the address of the owner
     * @return The address of the owner.
     */
    function owner() external view returns (address);

    /**
     * @notice Set the address of the new owner of the contract
     * @param account The address of the new owner of the contract
     */
    function transferOwnership(address account) external;
}
