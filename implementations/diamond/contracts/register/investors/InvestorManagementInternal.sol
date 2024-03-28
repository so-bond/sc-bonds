// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

// import { CouponSnapshotManagementInternal } from "../snapshot/CouponSnapshotManagementInternal.sol";
import { IInvestorManagementInternal } from "./IInvestorManagementInternal.sol";
import { InvestorManagementStorage } from "./InvestorManagementStorage.sol";
import { RegisterRoleManagementInternal } from "../role/RegisterRoleManagementInternal.sol";

contract InvestorManagementInternal is
    IInvestorManagementInternal,
    RegisterRoleManagementInternal
{
    /**
     * @dev check whether investor is allowed for transfer (whitelisting)
     */
    function _investorsAllowed(address investor) internal view returns (bool) {
        InvestorManagementStorage.Layout storage l = InvestorManagementStorage
            .layout();
        return l.investorInfos[investor].allowed;
    }

    function _investorCustodian(
        address investor
    ) internal view returns (address) {
        InvestorManagementStorage.Layout storage l = InvestorManagementStorage
            .layout();
        return l.investorInfos[investor].custodian;
    }

    function _getAllInvestors() internal view returns (address[] memory) {
        InvestorManagementStorage.Layout storage l = InvestorManagementStorage
            .layout();
        return l.investorsList;
    }

    /**
     * @dev called by _enebaleInvestor and the primary issuance to defined the BnD
     */
    function _initInvestor(
        address investor_,
        address custodian_,
        bool allowed
    ) internal {
        InvestorManagementStorage.Layout storage l = InvestorManagementStorage
            .layout();
        uint256 index = l.investorsList.length;
        l.investorsList.push(investor_);
        l.investorInfos[investor_].index = index;
        l.investorInfos[investor_].investor = investor_;
        l.investorInfos[investor_].custodian = custodian_;
        l.investorInfos[investor_].allowed = allowed;
    }

    /**
     * @dev called by enableInvestorToWhitelist
     */
    function _enableInvestor(address investor_, address custodian_) internal {
        InvestorManagementStorage.Layout storage l = InvestorManagementStorage
            .layout();
        if (_investorsAllowed(investor_)) {
            //since _enableInvestor is called upon each transferFrom, do nothing if already enabled
            return;
        }

        bool isNew = l.investorInfos[investor_].custodian == address(0);
        if (isNew) {
            // first whitelisting
            _initInvestor(investor_, custodian_, true);
        } else {
            //only investor's custodian may re-enable the investor state
            require(
                l.investorInfos[investor_].custodian == custodian_,
                "only the custodian can disallow the investor"
            );
            l.investorInfos[investor_].allowed = true;
        }
        emit EnableInvestor(investor_);
    }

    function _enableInvestorToWhitelist(address investor_) internal {
        InvestorManagementStorage.Layout storage l = InvestorManagementStorage
            .layout();
        require(investor_ != address(0), "investor address cannot be zero");
        bool isNew = l.investorInfos[investor_].custodian == address(0);

        //CAK may edit investor allowed status if whitelisting exist.
        if (_hasRole(CAK_ROLE, _msgSender())) {
            require(!isNew, "investor must be set up first");
            l.investorInfos[investor_].allowed = true;
            return;
        }

        require(_hasRole(CST_ROLE, _msgSender()), "Caller must be CST");

        _enableInvestor(investor_, _msgSender());
    }

    function _disableInvestorFromWhitelist(address investor_) internal {
        InvestorManagementStorage.Layout storage l = InvestorManagementStorage
            .layout();
        require(investor_ != address(0), "investor address cannot be zero");

        //CAK may edit investor allowed status if whitelisting exist.
        if (_hasRole(CAK_ROLE, _msgSender())) {
            require(
                l.investorInfos[investor_].custodian != address(0),
                "investor must be set up first"
            );
            l.investorInfos[investor_].allowed = false;
            return;
        }

        require(_hasRole(CST_ROLE, _msgSender()), "Caller must be CST");
        require(
            l.investorInfos[investor_].custodian == _msgSender(),
            "only the custodian can disallow the investor"
        );
        l.investorInfos[investor_].allowed = false;

        emit DisableInvestor(investor_);
    }
}
