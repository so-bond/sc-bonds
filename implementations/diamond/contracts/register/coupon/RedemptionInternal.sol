// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IRedemptionInternal } from "./IRedemptionInternal.sol";
import { RedemptionStorage } from "./RedemptionStorage.sol";
import { Coupon } from "./Coupon.sol";
import { CouponStorage } from "./CouponStorage.sol";
import { RegisterMetadataInternal } from "../metadata/RegisterMetadataInternal.sol";
import { ERC2771ContextInternal } from "../../metatx/ERC2771ContextInternal.sol";

abstract contract RedemptionInternal is
    IRedemptionInternal,
    ERC2771ContextInternal,
    Coupon
{
    // TODO check if necessary
    function _msgSender()
        internal
        view
        virtual
        override(ERC2771ContextInternal, RegisterMetadataInternal)
        returns (address)
    {
        return super._msgSender();
    }

    // TODO check if necessary
    function _msgData()
        internal
        view
        virtual
        override(ERC2771ContextInternal, RegisterMetadataInternal)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    function _investorRedemptionPayments(
        address _investor
    ) internal view returns (PaymentStatus) {
        RedemptionStorage.Layout storage redemptionLayout = RedemptionStorage
            .layout();
        return redemptionLayout.investorRedemptionPayments[_investor];
    }

    function _getMaturityAmountForInvestor(
        address _investor
    ) internal view returns (uint256 paymentAmount) {
        CouponStorage.Layout storage couponLayout = CouponStorage.layout();
        uint256 unitValue = _getBondUnitValue();
        uint256 balance = _balanceOfCoupon(_investor, couponLayout.couponDate);
        uint256 maturityAmount = unitValue * balance;
        // Number of decimal is 0
        return (maturityAmount);
    }

    function _getTotalMaturityAmount()
        internal
        view
        returns (uint256 paymentAmount)
    {
        uint256 unitValue = _getBondUnitValue();
        uint256 balance = _totalSupply();
        uint256 maturityAmount = unitValue * balance;
        // Number of decimal is 0
        return (maturityAmount);
    }

    function _getInvestorRedemptionPayments(
        address _investor
    ) internal view returns (PaymentStatus) {
        RedemptionStorage.Layout storage redemptionLayout = RedemptionStorage
            .layout();
        return redemptionLayout.investorRedemptionPayments[_investor];
    }

    function _toggleRedemptionPayment(address _investor) internal nonReentrant {
        RedemptionStorage.Layout storage redemptionLayout = RedemptionStorage
            .layout();
        CouponStorage.Layout storage couponLayout = CouponStorage.layout();
        require(_investorsAllowed(_investor), "This investor is not allowed");

        // The status control is important here because the actualTimestamp is zero before the status gets Ready
        require(
            couponLayout.status == CouponStatus.Ready,
            "The status of the Redemption should be Ready"
        );

        PaymentStatus initialStatus = redemptionLayout
            .investorRedemptionPayments[_investor];

        if (_isCAK(_msgSender())) {
            if (
                redemptionLayout.investorRedemptionPayments[_investor] ==
                PaymentStatus.ToBePaid
            ) {
                //uint256 currentCouponDate = _makeDatetime(couponDate);
                require(
                    block.timestamp > couponLayout.actualTimestamp,
                    "the maturity cut of time has not passed"
                );

                redemptionLayout.investorRedemptionPayments[
                    _investor
                ] = PaymentStatus.Paid;

                //force transfer de l'investisseur vers le primary issuance account de la totalité
                //de la balance lorsque l'on passe de tobepaid a paid et si balance > 0
                uint256 investorBalance = _balanceOf(_investor);

                if (investorBalance > 0) {
                    require(
                        _returnBalanceToPrimaryIssuanceAccount(_investor),
                        "return balance expected but failed"
                    );
                }
            } else if (
                redemptionLayout.investorRedemptionPayments[_investor] ==
                PaymentStatus.Paid
            ) {
                redemptionLayout.investorRedemptionPayments[
                    _investor
                ] = PaymentStatus.ToBePaid;
            } else {
                revert(
                    "The status of this investor's payment should be Paid or ToBePaid"
                );
            }
        } else if (_isCustodian(_msgSender())) {
            require(
                _investorCustodian(_investor) == _msgSender(),
                "You are not custodian of this investor"
            );
            if (
                redemptionLayout.investorRedemptionPayments[_investor] ==
                PaymentStatus.Paid
            ) {
                redemptionLayout.investorRedemptionPayments[
                    _investor
                ] = PaymentStatus.PaymentReceived;
            } else if (
                redemptionLayout.investorRedemptionPayments[_investor] ==
                PaymentStatus.PaymentReceived
            ) {
                redemptionLayout.investorRedemptionPayments[
                    _investor
                ] = PaymentStatus.Paid;
            } else {
                revert("Invalid Coupon payment status");
            }
        } else {
            revert("sender must be Central Account Keeper or Custodian");
        }

        emit RedemptionPaymentStatusChanged(
            // couponLayout.register,
            couponLayout.couponDate,
            _investor,
            redemptionLayout.investorRedemptionPayments[_investor],
            initialStatus
        );
    }

    function _paymentIdRedemptionForInvest(
        address _investor
    ) internal view returns (bytes8) {
        //TODO: could also be generated by the JS backend
        return
            bytes8(
                keccak256(
                    abi.encodePacked(address(this), _investor, "redemption")
                )
            );
    }
}
