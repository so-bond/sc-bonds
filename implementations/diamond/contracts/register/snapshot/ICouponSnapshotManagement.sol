// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { ICouponSnapshotManagementInternal } from "./ICouponSnapshotManagementInternal.sol";
import { IERC20Snapshot } from "../../token/ERC20/extensions/IERC20Snapshot.sol";
import { IERC20Metadata } from "../../token/ERC20/extensions/IERC20Metadata.sol";

interface ICouponSnapshotManagement is
    ICouponSnapshotManagementInternal,
    IERC20Snapshot,
    IERC20Metadata
{
    /**
     * @notice Retrieve the balance of `account` at the coupon date that
     *          must have been set by the setCurrentCouponDate before.
     * @param account The address of the account to retrieve the balance of.
     */
    function balanceOfCoupon(
        address account,
        uint256 _couponDate
    ) external view returns (uint256);

    /**
     * @notice Retrieve the total supply at the coupon date that
     *          must have been set by the setCurrentCouponDate before.
     * @param _couponDate The coupon date to retrieve the total supply at.
     * @return The total supply at the coupon date.
     */
    function totalSupplyAtCoupon(
        uint256 _couponDate
    ) external view returns (uint256);

    /**
     * @notice Retrieve the current coupon date.
     * @return The current coupon date.
     */
    function currentCouponDate() external view returns (uint256);

    /**
     * @notice Retrieve the current snapshot datetime.
     * @return The current snapshot datetime.
     */
    function currentSnapshotDatetime() external view returns (uint256);

    /**
     * @notice Retrieve the next snapshot datetime.
     * @return The next snapshot datetime.
     */
    function nextSnapshotDatetime() external view returns (uint256);

    /**
     * @notice Get the investor list at a coupon date
     * @param CouponDate The coupon date
     * @return The list of investors
     */
    function getInvestorListAtCoupon(
        uint256 CouponDate
    ) external returns (address[] memory);

    /**
     * @notice Mint `amount_` tokens to primary issuance account.
     * @param amount_ The amount of tokens to mint.
     *
     * @dev The aim of this function is to enable the CAK to mint some bond units
     */
    function mint(uint256 amount_) external;

    /**
     * @notice Burn `amount_` tokens from primary issuance account.
     * @param amount_ The amount of tokens to burn.
     *
     * @dev The aim of this function is to enable the CAK or IP to burn some bond units
     */
    function burn(uint256 amount_) external;
}
