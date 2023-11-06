// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRegisterRoleManagementInternal } from "./IRegisterRoleManagementInternal.sol";
import { IAccessControl } from "../../access/rbac/IAccessControl.sol";

interface IRegisterRoleManagement is IRegisterRoleManagementInternal {
    /**
     * @notice Return the address of the Register admin
     * @return address of the Register admin
     */
    function registerAdmin() external view returns (address);

    /**
     * @notice Return the address of the new Register admin
     * @return address of the new Register admin
     */
    function addressForNewAdmin() external view returns (address);

    /**
     * @notice Return the address of the first voter for the new Register admin
     * @return address of the first voter for the new Register admin
     */
    function firstVoterForNewAdmin() external view returns (address);

    /**
     * @notice Check if the caller has the B&D role
     * @param account The address of the caller
     * @return true if the caller has the B&D role
     */
    function isBnD(address account) external view returns (bool);

    /**
     * @notice Check if the caller has the Paying agent role
     * @param account The address of the caller
     * @return true if the caller has the Paying agent role
     */
    function isPay(address account) external view returns (bool);

    /**
     * @notice Check if the caller has the Custodian role
     * @param account The address of the caller
     * @return true if the caller has the Custodian role
     */
    function isCustodian(address account) external view returns (bool);

    /**
     * @notice Check if the caller has the CAK role
     * @param account The address of the caller
     * @return true if the caller has the CAK role
     */
    function isCAK(address account) external view returns (bool);

    /**
     * @notice Enable the change of the DEFAULT_ADMIN_ROLE, when 2 CAK request it.
     * When a CAK has already voted for an address, another CAK can erase the choice
     *      by voting for another address
     * @param account The address of the new admin
     */
    function changeAdminRole(address account) external;

    /**
     * @notice Grant CAK role to an address
     * @param cakAddress The address to grant the CAK role to
     */
    function grantCakRole(address cakAddress) external;

    /**
     * @notice Revoke CAK role from an address
     * @param cakAddress The address to revoke the CAK role from
     */
    function revokeCakRole(address cakAddress) external;

    /**
     * @notice Grant B&D role to an address
     * @param bndAddress The address to grant the B&D role to
     */
    function grantBndRole(address bndAddress) external;

    /**
     * @notice Revoke B&D role from an address
     * @param bndAddress The address to revoke the B&D role from
     */
    function revokeBndRole(address bndAddress) external;

    /**
     * @notice Grant Custodian role to an address
     * @param cstAddress The address to grant the Custodian role to
     */
    function grantCstRole(address cstAddress) external;

    /**
     * @notice Revoke Custodian role from an address
     * @param cstAddress The address to revoke the Custodian role from
     */
    function revokeCstRole(address cstAddress) external;

    /**
     * @notice Grant Paying agent role to an address
     * @param cstAddress The address to grant the Paying agent role to
     */
    function grantPayRole(address cstAddress) external;

    /**
     * @notice Revoke Paying agent role from an address
     * @param cstAddress The address to revoke the Paying agent role from
     */
    function revokePayRole(address cstAddress) external;
}
