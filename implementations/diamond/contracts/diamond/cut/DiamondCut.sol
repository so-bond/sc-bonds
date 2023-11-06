// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { OwnableInternal } from "../../access/ownable/OwnableInternal.sol";
import { IDiamondCut } from "./IDiamondCut.sol";
import { DiamondCutInternal } from "./DiamondCutInternal.sol";

/**
 * @title EIP-2535 "Diamond" proxy update contract
 */
abstract contract DiamondCut is
    IDiamondCut,
    DiamondCutInternal,
    OwnableInternal
{
    /**
     * @inheritdoc IDiamondCut
     */
    function diamondCut(
        FacetCut[] calldata facetCuts,
        address target,
        bytes calldata data
    ) external onlyOwner {
        _diamondCut(facetCuts, target, data);
    }
}
