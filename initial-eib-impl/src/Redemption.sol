// SPDX-License-Identifier: MIT
// SATURN project (last updated v0.1.0)

pragma solidity 0.8.17;

import "./intf/IRegister.sol";
import "./intf/ICoupon.sol";
import "./Coupon.sol";

//FIXME: redemtpion at the same step as the last Coupon 3; may inherit from Coupon

contract Redemption is Coupon {

    /**
     * @notice This contract must be authorized in the register to interact with it
     * The constructor cannot be checked by the register by looking ain the hash of 
     * the runtime bytecode because this hash does not cover the constructor.
     * so controls in the constructors are to be replicated in the first interaction with a function
     */

    event RedemptionPaymentStatusChanged(IRegister indexed register, uint256 indexed couponDate, address indexed investor, PaymentStatus status, PaymentStatus previousStatus);

    mapping(address => PaymentStatus) public investorRedemptionPayments;

    event RedemptionChanged(
        IRegister indexed register,
        uint256 indexed couponDate,
        CouponStatus indexed status
    );

    constructor(
        address _registerContract,
        uint256 _maturityDate,
        uint256 _nbDays,
        uint256 _recordDate,
        uint256 _cutOfTime
    ) Coupon(_registerContract, _maturityDate, _nbDays, _recordDate, _cutOfTime) {
        //CASE1: maturity= last coupn
        //CASE 2 maturity is different from last coupon date
        // require( //already doen in parent constructor
        //     register.isPay(msg.sender),
        //     "Sender must be a Paying calculation agent"
        // );
        require(
            register.checkIfMaturityDateExists(_maturityDate),
            "this maturity Date does not exists"
        );
        emit RedemptionChanged(register, couponDate, status);
    }

    function getMaturityAmountForInvestor(address _investor)
        public
        view
        returns (uint256 paymentAmount)
    {
        uint256 unitValue = register.getBondUnitValue();
        uint256 balance = register2.balanceOfCoupon(_investor, couponDate);
        uint256 maturityAmount = unitValue * balance;
        // Number of decimal is 0
        return (maturityAmount);
    }

    function getTotalMaturityAmount()
        public
        view
        returns (uint256 paymentAmount)
    {
        uint256 unitValue = register.getBondUnitValue();
        uint256 balance = register.totalSupply();
        uint256 maturityAmount = unitValue * balance;
        // Number of decimal is 0
        return (maturityAmount);
    }

    function getInvestorRedemptionPayments(address _investor)
        public
        view
        returns (PaymentStatus)
    {
        return investorRedemptionPayments[_investor];
    }

    function toggleRedemptionPayment(address _investor) public nonReentrant {
        require(
            register.investorsAllowed(_investor),
            "This investor is not allowed"
        );

        // The status control is important here because the actualTimestamp is zero before the status gets Ready
        require(
            status == CouponStatus.Ready,
            "The status of the Redemption should be Ready"
        );

        PaymentStatus initialStatus = investorRedemptionPayments[_investor];

        if (register.isCAK(msg.sender)) {
            if (
                investorRedemptionPayments[_investor] == PaymentStatus.ToBePaid
            ) {
                //uint256 currentCouponDate = _makeDatetime(couponDate);
                require(
                    block.timestamp > actualTimestamp,
                    "the maturity cut of time has not passed"
                );

                investorRedemptionPayments[_investor] = PaymentStatus.Paid;

                //force transfer de l'investisseur vers le primary issuance account de la totalité
                //de la balance lorsque l'on passe de tobepaid a paid et si balance > 0
                uint256 investorBalance = register.balanceOf(_investor);

                if (investorBalance > 0) {
                    require(
                        register.returnBalanceToPrimaryIssuanceAccount(
                            _investor
                        ), "return balance expected but failed" );
                }
            } else if (
                investorRedemptionPayments[_investor] == PaymentStatus.Paid
            ) {
                investorRedemptionPayments[_investor] = PaymentStatus.ToBePaid;
            } else
            {
            require(false,"The status of this investor's payment should be Paid or ToBePaid");
            }



        } else if (register.isCustodian(msg.sender)) {
            require(
                register.investorCustodian(_investor) == msg.sender,
                "You are not custodian of this investor"
            );
            if (investorRedemptionPayments[_investor] == PaymentStatus.Paid) {
                investorRedemptionPayments[_investor] = PaymentStatus.PaymentReceived;
            } else if (
                investorRedemptionPayments[_investor] == PaymentStatus.PaymentReceived
            ) {
                investorRedemptionPayments[_investor] = PaymentStatus.Paid;
            } else {
                require(false, "Invalid Coupon payment status");
            }
        } 
        
        else
        require(false, "sender must be Central Account Keeper or Custodian");

        emit RedemptionPaymentStatusChanged(register, couponDate, _investor, investorRedemptionPayments[_investor], initialStatus);
    }

    function paymentIdRedemptionForInvest(address _investor)
        external
        view
        returns (bytes8)
    {
        //TODO: could also be generated by the JS backend
        return
            bytes8(
                keccak256(
                    abi.encodePacked(address(this), _investor, "redemption")
                )
            );
    }
}
