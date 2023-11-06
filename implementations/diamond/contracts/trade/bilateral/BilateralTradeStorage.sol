// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegister } from "../../register/IRegister.sol";
import { IBilateralTradeInternal } from "./IBilateralTradeInternal.sol";

library BilateralTradeStorage {
    struct Layout {
        IRegister register;
        address sellerAccount;
        IBilateralTradeInternal.TradeStatus status;
        IBilateralTradeInternal.TradeDetail details;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("cacib.contracts.storage.BilateralTrade");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
