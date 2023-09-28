// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "./intf/IBilateralTrade.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BilateralTrade is IBilateralTrade, ReentrancyGuard {
    IRegister public register;
    Status public status;
    address public sellerAccount;
    TradeDetail public details;

    /**
     * @dev when the smart contract deploys :
     * - we check that deployer has been whitelisted
     * - we check that buyer has been whitelisted
     * - we map the register contract to interact with it
     * - variable sellerAccount gets msg.sender address
     * - details struct buyer gets buyer address
     * - status of current contract is Draft
     * The constructor cannot be checked by the register by looking ain the hash of 
     * the runtime bytecode because this hash does not cover the constructor.
     * so controls in the constructors are to be replicated in the first interaction with a function
     */
    constructor(IRegister _register, address _buyer) {
        require(
            _register.investorsAllowed(msg.sender) || _register.isBnD(msg.sender),
            "Sender must be a valid investor"
        );

        require(
            _register.investorsAllowed(_buyer),
            "Buyer must be a valid investor"
        );

        register = _register;
        sellerAccount = msg.sender;
        details.buyer = _buyer;
        status = Status.Draft;
        emit NotifyTrade(
            msg.sender,
            _buyer,
            status,
            0
        );
    }

    /**
     * @dev gets the buyer address
     */
    function buyerAccount() public view returns (address) {
        return details.buyer;
    }

    /**
     * @dev produces a unique payiment identifier
     */
    function paymentID() public view returns (bytes8) {
        uint64 low = uint64(uint160(address(this)));
        return bytes8(low);
    }

    /**
     * @dev enables the sellerAccount address to update the bilateral trade detail
     * can be called only if status of current contract is Draft
     can be called only if buyer updated is whitelisted
    */
    function setDetails(TradeDetail memory _details) public {
        require(
            msg.sender == sellerAccount,
            "Only the seller can update this trade"
        );
        require(
            status == Status.Draft,
            "Cannot change the trade details unless in draft status"
        );
        require(
            register.investorsAllowed(_details.buyer),
            "Buyer must be a valid investor even on changing details"
        );
        details = _details;
        // an event needs to be generated to enable the back end to know that the trade has been changed
        emit NotifyTrade(
            sellerAccount,
            _details.buyer,
            status,
            _details.quantity
        );
    }

    /**
     * @dev gets the bilateral trade details
     */
    function getDetails() public view returns (TradeDetail memory) {
        return details;
    }

    /**
     * @dev enables the approval of the bilateral trade in 2 steps :
     * 1) caller is seller account address and smart contract is in status Draft
     * --> status becomes Pending and emits an event
     * 2) Caller is buyer account address and smart contract is in status Pending
     * --> transfer the tokens from B&D account to buyer
     * --> status becomes Accepted and emits an event
     */
    function approve() public returns(Status) {
        if (msg.sender == sellerAccount && status == Status.Draft) {
            require(details.quantity > 0, "quantity not defined");
            require(details.tradeDate > 0, "trade date not defined");
            // Remove the control because it is functionally possible to need to create a back value trade
            // But add the control that the value is defined
            require(details.valueDate > 0, "value date not defined");

            // require(
            //     details.valueDate >= details.tradeDate,
            //     "value date not defined greater or equal than the trade date"
            // );
            status = Status.Pending;
            emit NotifyTrade(
                sellerAccount,
                details.buyer,
                status,
                details.quantity
            );
            return(status);
        }

        if (msg.sender == details.buyer && status == Status.Pending) {
            // require(
            //     register.transferFrom(
            //         sellerAccount,
            //         details.buyer,
            //         details.quantity
            //     ),
            //     "the transfer has failed"
            // );
            status = Status.Accepted;
            emit NotifyTrade(
                sellerAccount,
                details.buyer,
                status,
                details.quantity
            );
            return(status);
        }
        require(false, "the trade cannot be approved in this current status");
        return(status);
    }

    /**
     * @dev enables the rejection of the bilateral trade in 2 possibilites :
     * 1) caller is seller account address and smart contract is in status Draft or Pending
     * --> status becomes Rejected and emits an event
     * 2) Caller is buyer account address and smart contract is in status Pending
     * --> status becomes Rejected and emits an event
     */
    function reject() public {
        require(status != Status.Rejected, "Trade already rejected");
        // seller can cancel the trade at any active state before the trade is executed
        if (msg.sender == sellerAccount && (status != Status.Executed)) {
            status = Status.Rejected;
            emit NotifyTrade(
                sellerAccount,
                details.buyer,
                status,
                details.quantity
            );
            return;
        }
        // buyer can cancel the trade when pending validation on his side or even after he has accepted the trade (but not when the seller prepares the trade (DRAFT))
        if (msg.sender == details.buyer && (status == Status.Pending || status == Status.Accepted)) {
            status = Status.Rejected;
            emit NotifyTrade(
                sellerAccount,
                details.buyer,
                status,
                details.quantity
            );
            return;
        }
        require(false, "the trade cannot be rejected in this current status");
    }

    function executeTransfer() public nonReentrant returns(bool) {
        require(
            msg.sender == sellerAccount,
            "Only the seller can confirm the payment on this trade"
        );
        require(
            status == Status.Accepted,
            "The trade must be accepted by the buyer before"
        );
        status = Status.Executed;
        // Actually make the transfer now
        bool success = 
            register.transferFrom(sellerAccount, details.buyer, details.quantity);
        require(
            success,
            "the transfer has failed"
        );
        emit NotifyTrade(
            sellerAccount,
            details.buyer,
            status,
            details.quantity
        );
        return true;
    }

}
