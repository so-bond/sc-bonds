// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegister } from "../../register/IRegister.sol";
import { IPrimaryIssuanceInternal } from "./IPrimaryIssuanceInternal.sol";

library PrimaryIssuanceStorage {
    struct Layout {
        IRegister register;
        address account;
        uint256 quantity;
        uint256 offerPrice;
        address primaryIssuanceAccount; /// TODO set to address(this) during initialization
        IPrimaryIssuanceInternal.TradeStatus status; // ? maybe it will clash with status in ReentrancyGuard?
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("cacib.contracts.storage.PrimaryIssuance");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
