// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IERC173 } from "./IERC173.sol";
import { IOwnable } from "./IOwnable.sol";
import { OwnableStorage } from "./OwnableStorage.sol";
import { OwnableInternal } from "./OwnableInternal.sol";

contract Ownable is IOwnable, OwnableInternal {
    /// @inheritdoc IERC173
    function owner() public view virtual returns (address) {
        return _owner();
    }

    /// @inheritdoc IERC173
    function transferOwnership(address account) public virtual onlyOwner {
        _transferOwnership(account);
    }

    /// @inheritdoc IOwnable
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }
}
