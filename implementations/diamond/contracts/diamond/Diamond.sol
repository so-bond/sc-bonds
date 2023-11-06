// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { IOwnable, Ownable, OwnableInternal } from "../access/ownable/Ownable.sol";
import { IERC165 } from "../introspection/IERC165.sol";
import { IERC173 } from "../access/ownable/IERC173.sol";
import { ERC165Storage } from "../introspection/ERC165Storage.sol";
import { ERC165 } from "../introspection/ERC165.sol";
import { DiamondBase } from "./base/DiamondBase.sol";
import { DiamondFallback, IDiamondFallback } from "./fallback/DiamondFallback.sol";
import { DiamondLoupe, IDiamondLoupe } from "./loupe/DiamondLoupe.sol";
import { DiamondCut, IDiamondCut } from "./cut/DiamondCut.sol";
import { IDiamond } from "./IDiamond.sol";
import { ERC2771ContextInternal } from "../metatx/ERC2771ContextInternal.sol";
import { ContextInternal } from "../metatx/ContextInternal.sol";

/**
 * @title "Diamond" proxy reference implementation
 */
abstract contract Diamond is
    IDiamond,
    DiamondBase,
    DiamondFallback,
    DiamondLoupe,
    DiamondCut,
    Ownable,
    ERC165,
    ERC2771ContextInternal
{
    function _msgSender()
        internal
        view
        virtual
        override(ERC2771ContextInternal, ContextInternal)
        returns (address sender)
    {
        return ERC2771ContextInternal._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(ERC2771ContextInternal, ContextInternal)
        returns (bytes calldata)
    {
        return ERC2771ContextInternal._msgData();
    }

    constructor() {
        bytes4[] memory selectors = new bytes4[](12);
        uint256 selectorIndex;

        // register DiamondFallback

        selectors[selectorIndex++] = IDiamondFallback
            .getFallbackAddress
            .selector;
        selectors[selectorIndex++] = IDiamondFallback
            .setFallbackAddress
            .selector;

        _setSupportedInterface(type(IDiamondFallback).interfaceId, true);

        // register DiamondWritable

        selectors[selectorIndex++] = IDiamondCut.diamondCut.selector;

        _setSupportedInterface(type(IDiamondCut).interfaceId, true);

        // register DiamondLoupe

        selectors[selectorIndex++] = IDiamondLoupe.facets.selector;
        selectors[selectorIndex++] = IDiamondLoupe
            .facetFunctionSelectors
            .selector;
        selectors[selectorIndex++] = IDiamondLoupe.facetAddresses.selector;
        selectors[selectorIndex++] = IDiamondLoupe.facetAddress.selector;

        _setSupportedInterface(type(IDiamondLoupe).interfaceId, true);

        // register ERC165

        selectors[selectorIndex++] = IERC165.supportsInterface.selector;

        _setSupportedInterface(type(IERC165).interfaceId, true);

        // register Ownable
        selectors[selectorIndex++] = Ownable.owner.selector;
        selectors[selectorIndex++] = Ownable.transferOwnership.selector;
        // TODO Use RBAC instead of ownership

        _setSupportedInterface(type(IERC173).interfaceId, true);

        // diamond cut

        FacetCut[] memory facetCuts = new FacetCut[](1);

        facetCuts[0] = FacetCut({
            target: address(this),
            action: FacetCutAction.ADD,
            selectors: selectors
        });

        _diamondCut(facetCuts, address(0), "");

        // set owner

        _setOwner(_msgSender());
    }

    receive() external payable override {}

    function _transferOwnership(
        address account
    ) internal virtual override(OwnableInternal) {
        super._transferOwnership(account);
    }

    /**
     * @inheritdoc DiamondFallback
     */
    function _getImplementation()
        internal
        view
        override(DiamondBase, DiamondFallback)
        returns (address implementation)
    {
        implementation = super._getImplementation();
    }
}
