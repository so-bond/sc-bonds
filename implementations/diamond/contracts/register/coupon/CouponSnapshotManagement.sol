// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { ICouponSnapshotManagement } from "./ICouponSnapshotManagement.sol";
import { CouponSnapshotManagementInternal, ERC20Metadata } from "./CouponSnapshotManagementInternal.sol";
import { IERC20Metadata } from "../../token/ERC20/extensions/IERC20Metadata.sol";
import { IERC20, ERC20Base } from "../../token/ERC20/base/ERC20Base.sol";
import { ERC2771ContextInternal } from "../../metatx/ERC2771ContextInternal.sol";

abstract contract CouponSnapshotManagement is
    ICouponSnapshotManagement,
    ERC2771ContextInternal,
    CouponSnapshotManagementInternal
{
    // TODO check if necessary
    function _msgSender()
        internal
        view
        virtual
        override(CouponSnapshotManagementInternal, ERC2771ContextInternal)
        returns (address)
    {
        return super._msgSender();
    }

    // TODO check if necessary
    function _msgData()
        internal
        view
        virtual
        override(CouponSnapshotManagementInternal, ERC2771ContextInternal)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    /// @inheritdoc IERC20Metadata
    function name()
        public
        view
        virtual
        override(IERC20Metadata, ERC20Metadata)
        returns (string memory)
    {
        return _name();
    }

    /// @inheritdoc IERC20Metadata
    function symbol()
        public
        view
        virtual
        override(IERC20Metadata, ERC20Metadata)
        returns (string memory)
    {
        return _symbol();
    }

    /// @inheritdoc IERC20Metadata
    function decimals()
        public
        view
        virtual
        override(IERC20Metadata, ERC20Metadata)
        returns (uint8)
    {
        return _decimals();
    }

    function transfer(
        address /*to_*/,
        uint256 /*amount_*/
    ) public virtual override(IERC20, ERC20Base) returns (bool) {
        revert("transfer is disabled");
    }

    function approve(
        address /*spender_*/,
        uint256 /*amount_*/
    ) public virtual override(IERC20, ERC20Base) returns (bool) {
        revert("approve is disabled");
    }

    /**
     * @dev
     * this function can be called by a CAK or an authorized smart contract (see mapping _contractsAllowed)
     * if called by the CAK, then the transfer is done
     * if called by an authorized smart contract, the transfer is done
     */
    function transferFrom(
        address from_,
        address to_,
        uint256 amount_
    ) public virtual override(IERC20, ERC20Base) returns (bool) {
        return _transferFrom(from_, to_, amount_);
    }

    /// @inheritdoc ICouponSnapshotManagement
    function balanceOfCoupon(
        address account,
        uint256 _couponDate
    ) external view virtual returns (uint256) {
        return _balanceOfCoupon(account, _couponDate);
    }

    /// @inheritdoc ICouponSnapshotManagement
    function totalSupplyAtCoupon(
        uint256 _couponDate
    ) public view virtual returns (uint256) {
        return _totalSupplyAtCoupon(_couponDate);
    }

    /// @inheritdoc ICouponSnapshotManagement
    function currentCouponDate() external view returns (uint256) {
        return _currentCouponDate();
    }

    /// @inheritdoc ICouponSnapshotManagement
    function currentSnapshotDatetime() external view returns (uint256) {
        return _currentSnapshotDatetime();
    }

    /// @inheritdoc ICouponSnapshotManagement
    function nextSnapshotDatetime() external view returns (uint256) {
        return _nextSnapshotDatetime();
    }

    // /// @inheritdoc ICouponSnapshotManagement
    // function investorsAllowed(
    //     address investor
    // ) public view override returns (bool) {
    //     return _investorsAllowed(investor);
    // }
}
