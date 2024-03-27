// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

library DelegateInvestorManagementStorage {
    struct Layout {
        mapping(address => address) private custodianDelegates; /// @dev Mapping of custodians to their delegates
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("sobond.contracts.storage.DelegateInvestorManagement");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
