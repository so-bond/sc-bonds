// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { ICouponSnapshotManagement } from "./ICouponSnapshotManagement.sol";
import { CouponSnapshotManagementInternal, ERC20Metadata } from "./CouponSnapshotManagementInternal.sol";
import { IERC20, IERC20Base, ERC20Base } from "../../token/ERC20/base/ERC20Base.sol";

contract CouponSnapshotManagement is
    ICouponSnapshotManagement,
    CouponSnapshotManagementInternal
{
    /**
     * @inheritdoc ICouponSnapshotManagement
     */
    function balanceOfCoupon(
        address account,
        uint256 _couponDate
    ) external view virtual returns (uint256) {
        return _balanceOfCoupon(account, _couponDate);
    }

    /**
     * @inheritdoc ICouponSnapshotManagement
     */
    function totalSupplyAtCoupon(
        uint256 _couponDate
    ) public view virtual returns (uint256) {
        return _totalSupplyAtCoupon(_couponDate);
    }

    /**
     * @inheritdoc ICouponSnapshotManagement
     */
    function currentCouponDate() external view returns (uint256) {
        return _currentCouponDate();
    }

    /**
     * @inheritdoc ICouponSnapshotManagement
     */
    function currentSnapshotDatetime() external view returns (uint256) {
        return _currentSnapshotDatetime();
    }

    /**
     * @inheritdoc ICouponSnapshotManagement
     */
    function nextSnapshotDatetime() external view returns (uint256) {
        return _nextSnapshotDatetime();
    }

    /**
     * @inheritdoc ICouponSnapshotManagement
     */
    function getInvestorListAtCoupon(
        uint256 CouponDate
    ) public view override returns (address[] memory) {
        return _getInvestorListAtCoupon(CouponDate);
    }

    /**
     * @dev transfer is disabled
     */
    function transfer(
        address /*to_*/,
        uint256 /*amount_*/
    ) public virtual override(ERC20Base, IERC20) returns (bool) {
        revert("transfer is disabled");
    }

    /**
     * @dev approve is disabled
     */
    function approve(
        address /*spender_*/,
        uint256 /*amount_*/
    ) public virtual override(ERC20Base, IERC20) returns (bool) {
        revert("approve is disabled");
    }

    // /**

    /**
     * @inheritdoc IERC20
     *
     * @dev this function can be called by a CAK or an authorized smart contract (see mapping _contractsAllowed)
     *      if called by the CAK, then the transfer is done
     *      if called by an authorized smart contract, the transfer is done
     */
    function transferFrom(
        address from_,
        address to_,
        uint256 amount_
    ) public virtual override(ERC20Base, IERC20) returns (bool) {
        return _transferFrom(from_, to_, amount_);
    }

    /**
     * @dev increaseAllowance is disabled
     */
    function increaseAllowance(
        address /*spender_*/,
        uint256 /*addedValue_*/
    ) public virtual override(ERC20Base, IERC20Base) returns (bool) {
        revert("increaseAllowance is disabled");
    }

    /**
     * @dev decreaseAllowance is disabled
     */
    function decreaseAllowance(
        address /*spender_*/,
        uint256 /*subtractedValue_*/
    ) public virtual override(ERC20Base, IERC20Base) returns (bool) {
        revert("decreaseAllowance is disabled");
    }

    /**
     * @dev The aim of this function is to enable the CAK to mint some bond units
     */
    function mint(uint256 amount_) public {
        _mint(amount_);
    }

    function burn(uint256 amount_) public {
        _burn(_msgSender(), amount_);
    }

    function lock(
        address from,
        address to,
        uint256 amount,
        bytes32 txId,
        bytes32 hL,
        bytes32 hR,
        bytes32 hC,
        uint256 pDate,
        uint256 dDate,
        bytes32 proof
    ) public {
        _lock(from, to, amount, txId, hL, hR, hC, pDate, dDate, proof);
    }

    function release(
        bytes32 txId,
        bytes32 secret,
        bytes32 proof,
        LStatus status_
    ) public {
        _release(txId, secret, proof, status_);
    }
}
