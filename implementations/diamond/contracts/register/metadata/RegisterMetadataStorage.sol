// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { IRegisterMetadataInternal } from "./IRegisterMetadataInternal.sol";

library RegisterMetadataStorage {
    struct Layout {
        IRegisterMetadataInternal.Status status;
        IRegisterMetadataInternal.BondData data;
        address primaryIssuanceAccount; // TODO set to address(this) during initialization
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("sobond.contracts.storage.RegisterMetadata");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
