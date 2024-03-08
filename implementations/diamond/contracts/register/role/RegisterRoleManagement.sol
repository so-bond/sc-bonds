// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { IRegisterRoleManagement } from "./IRegisterRoleManagement.sol";
import { RegisterRoleManagementInternal } from "./RegisterRoleManagementInternal.sol";
import { IAccessControl } from "../../access/rbac/AccessControl.sol";

contract RegisterRoleManagement is
    IRegisterRoleManagement,
    RegisterRoleManagementInternal
{
    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function registerAdmin() public view returns (address) {
        return _registerAdmin();
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function addressForNewAdmin() public view returns (address) {
        return _addressForNewAdmin();
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function firstVoterForNewAdmin() public view returns (address) {
        return _firstVoterForNewAdmin();
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function votesForNewAdmin() public view returns (uint8) {
        return _votesForNewAdmin();
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function isBnD(address account) public view returns (bool) {
        return _isBnD(account);
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function isPay(address account) public view returns (bool) {
        return _isPay(account);
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function isCustodian(address account) public view returns (bool) {
        return _isCustodian(account);
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function isCAK(address account) public view returns (bool) {
        return _isCAK(account);
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function changeAdminRole(address account) public override {
        _changeAdminRole(account);
    }

    /**
     * @inheritdoc IAccessControl
     */
    function grantRole(bytes32 role, address account) public virtual override {
        _grantRole(role, account);
    }

    /**
     * @inheritdoc IAccessControl
     */
    function revokeRole(bytes32 role, address account) public virtual override {
        _revokeRole(role, account);
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function grantCakRole(address cakAddress_) public override {
        _grantCakRole(cakAddress_);
    }

    /**
     * @inheritdoc IRegisterRoleManagement
     */
    function revokeCakRole(address cakAddress_) public override {
        _revokeCakRole(cakAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to grant B&D role to an address
     */
    function grantBndRole(address bndAddress_) public override {
        _grantBndRole(bndAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to revoke B&D role of an address
     */
    function revokeBndRole(address bndAddress_) public override {
        _revokeBndRole(bndAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to grant CUSTODIAN role to an address
     */
    function grantCstRole(address cstAddress_) public override {
        _grantCstRole(cstAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to revoke CUSTODIAN role of an address
     */
    function revokeCstRole(address cstAddress_) public override {
        _revokeCstRole(cstAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to grant PAYING AGENT role to an address
     */
    function grantPayRole(address payAddress_) public override {
        _grantPayRole(payAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to revoke PAYING AGENT role of an address
     */
    function revokePayRole(address payAddress_) public override {
        _revokePayRole(payAddress_);
    }
}
