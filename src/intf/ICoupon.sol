// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

// TODO: This interface is not used, we should decide what to do, either complete it and use it or remove it.

interface ICoupon {

    function computesCouponAmount() external;
    function setDateAsCurrentCoupon() external;
    function setNbDays(uint256 _nbDays) external;

}


