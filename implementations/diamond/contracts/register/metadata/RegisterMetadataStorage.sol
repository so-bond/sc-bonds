// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegisterMetadataInternal } from "./IRegisterMetadataInternal.sol";

library RegisterMetadataStorage {
    struct Layout {
        IRegisterMetadataInternal.Status status;
        IRegisterMetadataInternal.BondData data;
        address primaryIssuanceAccount; /// TODO set to address(this) during initialization
        mapping(address => IRegisterMetadataInternal.InvestorInfo) investorInfos; /// @dev mapping of an address to the custodian address or none if not listed
        address[] investorsList;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("cacib.contracts.storage.Register");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }

    // TODO move to role management
    bytes32 public constant CAK_ROLE = keccak256("CAK_ROLE");
    bytes32 public constant BND_ROLE = keccak256("BND_ROLE"); //B&D role
    bytes32 public constant CST_ROLE = keccak256("CST_ROLE"); //Custodian role
    bytes32 public constant PAY_ROLE = keccak256("PAY_ROLE"); //Paying agent role
}
