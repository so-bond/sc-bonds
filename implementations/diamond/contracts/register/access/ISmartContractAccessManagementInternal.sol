// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

interface ISmartContractAccessManagementInternal {
    event EnableContract(bytes32 contractHash);

    event DisableContract(bytes32 contractHash);
}
