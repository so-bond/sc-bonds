// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

interface IDiamondCutInternal {
    enum FacetCutAction {
        ADD,
        REPLACE,
        REMOVE
    }

    event DiamondCut(FacetCut[] facetCuts, address target, bytes data);

    error DiamondCut__InvalidInitializationParameters();
    error DiamondCut__RemoveTargetNotZeroAddress();
    error DiamondCut__ReplaceTargetIsIdentical();
    error DiamondCut__SelectorAlreadyAdded();
    error DiamondCut__SelectorIsImmutable();
    error DiamondCut__SelectorNotFound();
    error DiamondCut__SelectorNotSpecified();
    error DiamondCut__TargetHasNoCode();

    struct FacetCut {
        address target;
        FacetCutAction action;
        bytes4[] selectors;
    }
}
