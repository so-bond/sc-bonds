// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { IDiamondCutInternal } from "./IDiamondCutInternal.sol";

/**
 * @title Diamond proxy upgrade interface
 * @dev see https://eips.ethereum.org/EIPS/eip-2535
 */
interface IDiamondCut is IDiamondCutInternal {
    /**
     * @notice Add/replace/remove any number of functions and optionally execute
     *                  a function with delegatecall
     * @param _facetCuts Contains the facet addresses and function selectors
     * @param _target The address of the contract or facet to execute _calldata
     * @param _calldata A function call, including function selector and arguments
     *                  _calldata is executed with delegatecall on _init
     */
    function diamondCut(
        FacetCut[] calldata _facetCuts,
        address _target,
        bytes calldata _calldata
    ) external;
}
