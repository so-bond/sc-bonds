// SPDX-License-Identifier: MIT
// SATURN project (last updated v0.1.0)

pragma solidity 0.8.17;

import "./intf/IRegister.sol";


contract SmartContractAccessManagement is ISmartContractAccessManagement {
    mapping(bytes32 => bool) public _contractsAllowed;

    function canManageSmartContracts() internal virtual view returns(bool) {
      return true;
    }

    function isCallerApprovedSmartContract() external override view returns(bool) {
      bytes32 hash = atReturningHash(msg.sender);
      return _contractsAllowed[hash];
    }

    /**
     * @dev The aim of this function is to enable smart contract to be whitelisted through the hash of its bytecode
     */
    function enableContractToWhitelist(bytes32 contractHash_) public override {
        require(canManageSmartContracts(), "Caller must be CAK");
        _contractsAllowed[contractHash_] = true;
        emit EnableContract(contractHash_);
    }

    /**
     * @dev The aim of this function is to disable smart contract to be whitelisted through the hash of its bytecode
     */
    function disableContractFromWhitelist(bytes32 contractHash_)
        public
        override
    {
        require(canManageSmartContracts(), "Caller must be CAK");
        _contractsAllowed[contractHash_] = false;
        emit DisableContract(contractHash_);
    }


    /**
     * @dev This function returns the bytecode'shash of the deployed smart contract address
     * source : https://gist.github.com/andreafspeziale/557fa432e9929ccf049459972e322bdf
     */
    function atReturningHash(address addr_) public view returns (bytes32 hash) {
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
