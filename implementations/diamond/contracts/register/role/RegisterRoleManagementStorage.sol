// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

library RegisterRoleManagementStorage {
    struct Layout {
        address registerAdmin;
        address addressForNewAdmin; // the future admin address
        address firstVoterForNewAdmin; // the first CAK requesting the admin change
        uint8 votesForNewAdmin; // count the votes, 0 or 1
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("sobond.contracts.storage.RegisterRoleManagement");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
