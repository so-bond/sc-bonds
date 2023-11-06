// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IOwnableInternal } from "./IOwnableInternal.sol";
import { OwnableStorage } from "./OwnableStorage.sol";
import { ContextInternal } from "../../metatx/ContextInternal.sol";

abstract contract OwnableInternal is IOwnableInternal, ContextInternal {
    modifier onlyOwner() {
        require(_msgSender() == _owner(), "ERC173: sender must be owner");
        _;
    }

    function _owner() internal view virtual returns (address) {
        return OwnableStorage.layout().owner;
    }

    function _transferOwnership(address account) internal virtual {
        _setOwner(account);
    }

    function _setOwner(address account) internal virtual {
        OwnableStorage.Layout storage l = OwnableStorage.layout();
        emit OwnershipTransferred(l.owner, account);
        l.owner = account;
    }
}
