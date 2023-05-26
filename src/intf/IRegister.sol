// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "./IRegisterMetadata.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";


interface IRegisterRoleManagement {
    function isBnD(address account) external view returns(bool);

    function isPay(address account) external view returns(bool);
    
    function isCustodian(address account) external view returns(bool);

    function isCAK(address account) external view returns(bool);

    function changeAdminRole(address account) external;

    function grantCakRole(address cakAddress) external;

    function revokeCakRole(address cakAddress) external;

    function grantBndRole(address bndAddress) external;

    function revokeBndRole(address bndAddress) external;

    function grantCstRole(address cstAddress) external;

    function revokeCstRole(address cstAddress) external;

    function grantPayRole(address cstAddress) external;

    function revokePayRole(address cstAddress) external;



    event AdminChanged(address indexed _addressForNewAdmin);

}

interface ICouponSnapshotManagement {


    function _snapshot() external returns(uint256);
    /**
     * @dev Emitted by {_snapshot} when a snapshot identified by `id` is created.
     */
    event Snapshot(uint256 id);

    function balanceOfAt(address account, uint256 snapshotId) external view returns (uint256);

    function balanceOfCoupon(address account, uint256 _couponDate) external view returns (uint256);

    function totalSupplyAt(uint256 snapshotId) external view returns (uint256);

    function totalSupplyAtCoupon(uint256 _couponDate) external view returns (uint256);

    function currentSnapshotDatetime() external view returns (uint256);

    function currentCouponDate() external view returns (uint256);
}

interface ISmartContractAccessManagement {
    function enableContractToWhitelist(bytes32 contractHash) external;

    function disableContractFromWhitelist(bytes32 contractHash) external;

    function isCallerApprovedSmartContract() external view returns(bool);

    event EnableContract(bytes32 contractHash);
    event DisableContract(bytes32 contractHash);

}

interface IRegister is IERC20Metadata, IRegisterMetadata, IRegisterRoleManagement, ISmartContractAccessManagement {

    enum Status {Draft, Ready, Issued, Repaid, Frozen}

    function primaryIssuanceAccount() external view returns (address);
    function returnBalanceToPrimaryIssuanceAccount(address investor) external returns (bool) ;

    function getAllInvestors() external view returns (address[] memory);
    function disableInvestorFromWhitelist(address investor) external;
    function enableInvestorToWhitelist(address investor) external;
    //TODO: maybe expose getInvestorInfo(address investor) returns (InvestorInfo)

    function investorsAllowed(address investor) external view returns (bool);
    function investorCustodian(address investor) external view returns (address);

    function checkIfCouponDateExists(uint256 _couponDate) external returns (bool);
    function checkIfMaturityDateExists(uint256 _maturityDate) external returns (bool);

    function makeReady() external;
    function revertReady() external;
    function publicMessage(address to, string memory message) external;
    function status() external view returns (Status);

    function setCurrentCouponDate(uint256 couponDate_, uint256 recordDatetime_) external;
    // function removeFrominvestorsList(uint256 index) external; // should only be private
    function getInvestorListAtCoupon(uint256 CouponDate) external returns (address[] memory);
    function toggleFrozen() external;
    
    event WalletAddedToWhitelist(address indexed toBeAdded);
    event WalletDeletedFromWhitelist(address indexed toBeDeleted);
    event EnableInvestor(address investor);
    event DisableInvestor(address investor);

    //FIXME: remove this and replace by RegisterStatusChanged
    event NewBondDrafted(address indexed creator, string name, string isin);

    event RegisterStatusChanged(
        address indexed emiter,
        string name,
        string isin,
        Status status
    );

    event PublicMessage(address indexed sender, address indexed target, string message);

    struct InvestorInfo {
        address investor; //TODO: de-normalisation maybe not needed
        bool allowed; // true if investor whitelisted for transfer
        uint256 index; // zero-based index on investor list
        address custodian;
    }
}
