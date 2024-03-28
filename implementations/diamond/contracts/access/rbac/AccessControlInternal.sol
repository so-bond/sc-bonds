// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IAccessControlInternal } from "./IAccessControlInternal.sol";
import { AccessControlStorage } from "./AccessControlStorage.sol";
import { EnumerableSet } from "../../data/EnumerableSet.sol";
import { AddressUtils } from "../../utils/AddressUtils.sol";
import { UintUtils } from "../../utils/UintUtils.sol";
import { ContextInternal } from "../../metatx/ContextInternal.sol";

/**
 * @title Role-based access control system
 * @dev derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)
 */
abstract contract AccessControlInternal is
    IAccessControlInternal,
    ContextInternal
{
    using AddressUtils for address;
    using EnumerableSet for EnumerableSet.AddressSet;
    using UintUtils for uint256;

    bytes32 internal constant DEFAULT_ADMIN_ROLE = 0x00;

    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    /*
     * @notice query whether role is assigned to account
     * @param role role to query
     * @param account account to query
     * @return whether role is assigned to account
     */
    function _hasRole(
        bytes32 role,
        address account
    ) internal view virtual returns (bool) {
        return
            AccessControlStorage.layout().roles[role].roleMembers.contains(
                account
            );
    }

    /**
     * @notice revert if sender does not have given role
     * @param role role to query
     */
    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, _msgSender());
    }

    /**
     * @notice revert if given account does not have given role
     * @param role role to query
     * @param account to query
     */
    function _checkRole(bytes32 role, address account) internal view virtual {
        if (!_hasRole(role, account)) {
            revert(
                string(
                    abi.encodePacked(
                        "AccessControl: account ",
                        account.toString(),
                        " is missing role ",
                        uint256(role).toHexString(32)
                    )
                )
            );
        }
    }

    /*
     * @notice query admin role for given role
     * @param role role to query
     * @return admin role
     */
    function _getRoleAdmin(
        bytes32 role
    ) internal view virtual returns (bytes32) {
        return AccessControlStorage.layout().roles[role].adminRole;
    }

    /**
     * @notice set role as admin role
     * @param role role to set
     * @param adminRole admin role to set
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        bytes32 previousAdminRole = _getRoleAdmin(role);
        AccessControlStorage.layout().roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    /*
     * @notice Grant role to given account
     * @param role role to grant
     * @param account recipient of role assignment
     */
    function _grantRole(bytes32 role, address account) internal virtual {
        AccessControlStorage.layout().roles[role].roleMembers.add(account);
        emit RoleGranted(role, account, _msgSender());
    }

    /*
     * @notice Revoke role from given account
     * @param role role to revoke
     * @parm account
     */
    function _revokeRole(bytes32 role, address account) internal virtual {
        AccessControlStorage.layout().roles[role].roleMembers.remove(account);
        emit RoleRevoked(role, account, _msgSender());
    }

    /**
     * @notice Renounce role
     * @param role role to renounce
     */
    function _renounceRole(bytes32 role) internal virtual {
        _revokeRole(role, _msgSender());
    }

    /**
     * @notice Setup role for given account
     * @param role role to set
     * @param account recipient of role assignment
     */
    function _setupRole(bytes32 role, address account) internal virtual {
        _grantRole(role, account);
    }

    /**
     * @notice query role for member at given index
     * @param role role to query
     * @param index index to query
     */
    function _getRoleMember(
        bytes32 role,
        uint256 index
    ) internal view virtual returns (address) {
        return AccessControlStorage.layout().roles[role].roleMembers.at(index);
    }

    /**
     * @notice query role for member count
     * @param role role to query
     */
    function _getRoleMemberCount(
        bytes32 role
    ) internal view virtual returns (uint256) {
        return AccessControlStorage.layout().roles[role].roleMembers.length();
    }
}
