// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "./intf/IPrimaryIssuance.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PrimaryIssuance is IPrimaryIssuance, ReentrancyGuard {
    IRegister public register;
    address public account;
    uint256 private quantity;
    uint256 public offerPrice;
    Status private __status; // changed to __status because _status already exists in ReentrancyGuard

    /**
     * @dev when the smart contract deploys :
     * - we check that deployer has B&D role
     * - we map the register contract to interact with it
     * - variable account gets msg.sender address
     *
     * The constructor cannot be checked by the register by looking ain the hash of 
     * the runtime bytecode because this hash does not cover the constructor.
     * so controls in the constructors are to be replicated in the first interaction with a function
     */
    constructor(IRegister _register, uint256 _offerPrice) {
        require(_register.isBnD(msg.sender), "Sender must be a B&D");
        register = _register;
        account = msg.sender;
        offerPrice = _offerPrice;
        __status = Status.Pending; //only 1 validation for primary issuance (see validate()
        quantity = register.balanceOf(register.primaryIssuanceAccount());
        emit NotifyTrade(
            register.primaryIssuanceAccount(),
            account,
            Status.Pending,
            quantity
        );
        emit PrimaryIssuanceCreated(address(this));
    }

    /**
     * @dev the function finalize :
     * - must be called by contract deployer
     * - do some actions if balance of Register contract is superior to zero
     * - if balance of Register contract is superior to zero, transfer the balance to B&D account,
     *   modify status of currenct contract to Accepted and set the status of Register contract to Issued
     */
    function validate() public nonReentrant {
        require(register.isBnD(msg.sender), "Sender must be a B&D");

        require(
            msg.sender == account,
            "only the beneficiary B&D should finalize"
        );

        require(
            __status != Status.Accepted && __status != Status.Executed,
            "The primary contract should be in initiated state"
        );

        // get the primary issuance balance
        quantity = register.balanceOf(register.primaryIssuanceAccount());

        if (quantity > 0) {
            // issuance account credited
            require(
                register.transferFrom(
                    register.primaryIssuanceAccount(),
                    account,
                    quantity
                ),
                "the transfer has failed"
            );
            //TODO: maybe replace that unexplicit "the transfer has failed" message
            __status = Status.Accepted;
            emit NotifyTrade(
                register.primaryIssuanceAccount(),
                account,
                Status.Accepted,
                quantity
            );
        }
    }

    function buyerAccount() public view returns (address) {
        return account;
    }

    function sellerAccount() public view returns (address) {
        return register.primaryIssuanceAccount();
    }

    function getDetails() public view returns (TradeDetail memory) {
        TradeDetail memory trade = TradeDetail({
            quantity: quantity,
            buyer: account,
            tradeDate: register.getCreationDate(),
            valueDate: register.getIssuanceDate(),
            price: offerPrice
        });
        return trade;
    }

    function reject() public {
        require(
            msg.sender == account,
            "only the beneficiary B&D can revert"
        );
        __status = Status.Rejected;     
        // get the primary issuance balance
        quantity = register.balanceOf(register.primaryIssuanceAccount());
       
        emit NotifyTrade(
                register.primaryIssuanceAccount(),
                account,
                __status,
                quantity
            );
    }


    function paymentID() public view returns (bytes8) {
        uint64 low = uint64(uint160(address(this)));
        return bytes8(low);
    }

    function status() public view returns (Status) {
        return __status;
    }
}
