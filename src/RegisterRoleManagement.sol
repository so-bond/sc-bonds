// SPDX-License-Identifier: MIT
// SATURN project (last updated v0.1.0)

pragma solidity 0.8.17;

import "./intf/IRegister.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Arrays.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract RegisterRoleManagement is AccessControl, IRegisterRoleManagement {
    address public registerAdmin;
    uint8 public _votesForNewAdmin; // count the votes, 0 or 1
    address public _addressForNewAdmin; // the future admin address
    address public _firstVoterForNewAdmin; // the first CAK requesting the admin change


    /**
     * Roles
     * They are managed through AccessControl smart contract
     * The roles are declared below
     */

    bytes32 public constant CAK_ROLE = keccak256("CAK_ROLE");
    bytes32 public constant BND_ROLE = keccak256("BND_ROLE"); //B&D role
    bytes32 public constant CST_ROLE = keccak256("CST_ROLE"); //Custodian role
    bytes32 public constant PAY_ROLE = keccak256("PAY_ROLE"); //Paying agent role

    constructor() {
      _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // contract deployer is DEFAULT_ADMIN_ROLE: AccessControl.sol magic: all roles can be administrated by the user having the DEFAULT_ADMIN_ROLE
      _setRoleAdmin(CAK_ROLE, CAK_ROLE); // BND_ROLE admin is CAK_ROLE
      registerAdmin = msg.sender; // We want a single admin for the register than can be changed by 2 CAK
      _setupRole(CAK_ROLE, msg.sender); // contract deployer is CAK_ROLE
      _setRoleAdmin(BND_ROLE, CAK_ROLE); // BND_ROLE admin is CAK_ROLE
      _setRoleAdmin(CST_ROLE, CAK_ROLE); // CST_ROLE admin is CAK_ROLE
      _setRoleAdmin(PAY_ROLE, CAK_ROLE); // PAY_ROLE admin is CAK_ROLE
    }

    function isBnD(address account) public view returns (bool) {
        return hasRole(BND_ROLE, account);
    }

    function isPay(address account) public view returns (bool) {
        return hasRole(PAY_ROLE, account);
    }

    function isCustodian(address account) public view returns (bool) {
        return hasRole(CST_ROLE, account);
    }

    function isCAK(address account) public view returns (bool) {
        return hasRole(CAK_ROLE, account);
    }

    /**
     * @dev The aim of this function is to enable the change of the DEFAULT_ADMIN_ROLE, when 2 CAK request it
     * When a CAK has already voted for an address, another CAK can erase the choice by voting for another address
     */
    function changeAdminRole(address account_) public override {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        require(account_ != registerAdmin, "New admin is the same as current one");
        // require( // removing this condition for now, might be usefull to allow an existing CAK to become admin
        //     account_ != msg.sender,
        //     "This CAK can not vote for his own address"
        // );

        // Reset the process of changing the admin
        if (account_ == address(0) && _votesForNewAdmin == 1) {
            _votesForNewAdmin = 0;
            _firstVoterForNewAdmin = address(0);
            _addressForNewAdmin = account_;
            return;
        }
        require(account_ != address(0), "The proposed new admin cannot be the zero address");

        // First caller, initializa the change process
        if (_votesForNewAdmin == 0) {
            _votesForNewAdmin = 1;
            _firstVoterForNewAdmin = msg.sender;
            _addressForNewAdmin = account_;
            return;
        }
        // Second caller, verify status and exectute change
        if (_votesForNewAdmin == 1) {
            if (account_ != _addressForNewAdmin) {
                // The second caller requested a different admin, reset the process
                _firstVoterForNewAdmin = msg.sender;
                _addressForNewAdmin = account_;
                return;
            } else {
                require( // need 2 different CAK to perform the change
                    _firstVoterForNewAdmin != msg.sender,
                    "This CAK has already voted"
                );
                // All good, execute the change
                _revokeRole(DEFAULT_ADMIN_ROLE, registerAdmin); // remove previous admin
                _setupRole(DEFAULT_ADMIN_ROLE, _addressForNewAdmin); // set new admin
                registerAdmin = _addressForNewAdmin;
                // and reset the state
                _votesForNewAdmin = 0;
                _firstVoterForNewAdmin = address(0);
                _addressForNewAdmin = address(0);
                emit AdminChanged(registerAdmin);
                return;
            }
        }
    }

    /**
    * @dev This function is the override of the public function in AccessControl
    * That must be rewritted to cover the special case of the CAK role
     */
    function grantRole(bytes32 role, address account) public virtual override {
        if (role == DEFAULT_ADMIN_ROLE) {
            require(false, "Use function changeAdminRole instead");
        } else if (role == CAK_ROLE) {
            require( hasRole(CAK_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
            , "Caller must be CAK or ADMIN to set another CAK");
        } else {
            require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK to set a role");
        }
        _grantRole(role, account);
    }

    /** 
    * @dev This function is the override of the public function in AccessControl
    * That must be rewritted to cover the special case of the CAK role
     */
    function revokeRole(bytes32 role, address account) public virtual override {
        if (role == DEFAULT_ADMIN_ROLE) {
            require(false, "Use function changeAdminRole instead");
        } if (role == CAK_ROLE) {
            require( hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
            , "Caller must be ADMIN to remove a CAK");
        } else {
            require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK to remove a role");
        }
        _revokeRole(role, account);
    }
    /**
     * @dev The aim of this function is to enable an ADMIN or a CAK to grant CAK role to an address
     */
    function grantCakRole(address cakAddress_) public override {
        grantRole(CAK_ROLE, cakAddress_);
    }

    /**
     * @dev The aim of this function is to enable the ADMIN to revoke CAK role of an address
     */
    function revokeCakRole(address cakAddress_) public override {
        revokeRole(CAK_ROLE, cakAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to grant B&D role to an address
     */
    function grantBndRole(address bndAddress_) public override {
        grantRole(BND_ROLE, bndAddress_);
        
    }

    /**
     * @dev The aim of this function is to enable a CAK to revoke B&D role of an address
     */
    function revokeBndRole(address bndAddress_) public override {
        revokeRole(BND_ROLE, bndAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to grant CUSTODIAN role to an address
     */
    function grantCstRole(address cstAddress_) public override {
        grantRole(CST_ROLE, cstAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to revoke CUSTODIAN role of an address
     */
    function revokeCstRole(address cstAddress_) public override {
        revokeRole(CST_ROLE, cstAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to grant PAYING AGENT role to an address
     */
    function grantPayRole(address payAddress_) public override {
        grantRole(PAY_ROLE, payAddress_);
    }

    /**
     * @dev The aim of this function is to enable a CAK to revoke PAYING AGENT role of an address
     */
    function revokePayRole(address payAddress_) public override {
        revokeRole(PAY_ROLE, payAddress_);
    }
}