// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { ISmartContractAccessManagementInternal } from "./ISmartContractAccessManagementInternal.sol";
import { SmartContractAccessManagementStorage } from "./SmartContractAccessManagementStorage.sol";
import { RegisterRoleManagementInternal } from "../role/RegisterRoleManagementInternal.sol";
import { ContextInternal } from "../../metatx/ContextInternal.sol";

abstract contract SmartContractAccessManagementInternal is
    ISmartContractAccessManagementInternal,
    ContextInternal,
    RegisterRoleManagementInternal
{
    function _canManageSmartContracts() internal view virtual returns (bool) {
        return _hasRole(CAK_ROLE, _msgSender());
    }

    function _isCallerApprovedSmartContract() internal view returns (bool) {
        SmartContractAccessManagementStorage.Layout
            storage l = SmartContractAccessManagementStorage.layout();
        bytes32 hash = _atReturningHash(_msgSender());
        return l.contractsAllowed[hash];
    }

    /**
     * @dev The aim of this function is to check if a smart contract is whitelisted through the hash of its bytecode
     */
    function _isContractAllowed(
        address contractAddress_
    ) internal view returns (bool) {
        SmartContractAccessManagementStorage.Layout
            storage l = SmartContractAccessManagementStorage.layout();
        bytes32 hash = _atReturningHash(contractAddress_);
        return l.contractsAllowed[hash];
    }

    /**
     * @dev The aim of this function is to enable smart contract to be whitelisted through the hash of its bytecode
     */
    function _enableContractToWhitelist(bytes32 contractHash_) internal {
        SmartContractAccessManagementStorage.Layout
            storage l = SmartContractAccessManagementStorage.layout();
        require(_canManageSmartContracts(), "Caller must be CAK");
        l.contractsAllowed[contractHash_] = true;
        emit EnableContract(contractHash_);
    }

    /**
     * @dev The aim of this function is to disable smart contract to be whitelisted through the hash of its bytecode
     */
    function _disableContractFromWhitelist(bytes32 contractHash_) internal {
        SmartContractAccessManagementStorage.Layout
            storage l = SmartContractAccessManagementStorage.layout();
        require(_canManageSmartContracts(), "Caller must be CAK");
        l.contractsAllowed[contractHash_] = false;
        emit DisableContract(contractHash_);
    }

    /**
     * @dev This function returns the bytecode'shash of the deployed smart contract address
     * source : https://gist.github.com/andreafspeziale/557fa432e9929ccf049459972e322bdf
     */
    function _atReturningHash(
        address addr_
    ) internal view returns (bytes32 hash) {
        bytes memory o_code;
        assembly {
            // retrieve the size of the code, this needs assembly
            let size := extcodesize(addr_)
            // allocate output byte array - this could also be done without assembly
            // by using o_code = new bytes(size)
            o_code := mload(0x40)
            // new "memory end" including padding
            mstore(
                0x40,
                add(o_code, and(add(add(size, 0x20), 0x1f), not(0x1f)))
            )
            // store length in memory
            mstore(o_code, size)
            // actually retrieve the code, this needs assembly
            extcodecopy(addr_, add(o_code, 0x20), 0, size)
        }

        hash = keccak256(o_code);
    }
}
