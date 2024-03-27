// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { InvestorManagementStorage } from "./InvestorManagementStorage.sol";
import { InvestorManagementInternal } from "../investors/InvestorManagementInternal.sol";
import { DelegateInvestorManagementStorage } from "./DelegateInvestorManagementStorage.sol";
import { IDelegateInvestorManagementInternal } from "./IDelegateInvestorManagementInternal.sol";

contract DelegateInvestorManagementInternal is
    IDelegateInvestorManagementInternal,
    InvestorManagementInternal,
{
    function _setCustodianDelegate(
        address delegate
    ) internal {
        require(_hasRole(CST_ROLE, _msgSender()), "Caller must be CST");
        DelegateInvestorManagementStorage.Layout storage l = DelegateInvestorManagementStorage
            .layout();
        address oldDelegate = l.custodianDelegates[_msgSender()];
        l.custodianDelegates[_msgSender()] = delegate;
        if (oldDelegate != address(0)) {
            emit CustodianDelegateUnset(_msgSender(), oldDelegate);
        }
        emit CustodianDelegateSet(_msgSender(), delegate);
    };

    function _unsetCustodianDelegate() internal {
        require(_hasRole(CST_ROLE, _msgSender()), "Caller must be CST");
        DelegateInvestorManagementStorage.Layout storage l = DelegateInvestorManagementStorage
            .layout();
        address oldDelegate = l.custodianDelegates[_msgSender()];
        l.custodianDelegates[_msgSender()] = address(0);
        emit CustodianDelegateUnset(_msgSender(), oldDelegate);
    }

    function _isCustodianDelegate(address custodian, address delegate) internal view returns (bool) {
        if (!_hasRole(CST_ROLE, custodian)) {
            return false;
        }
        DelegateInvestorManagementStorage.Layout storage l = DelegateInvestorManagementStorage
            .layout();
        return l.custodianDelegates[custodian] == delegate;
    }

    function _getCustodianDelegate(address custodian) internal view returns (address memory) {
        DelegateInvestorManagementStorage.Layout storage l = DelegateInvestorManagementStorage
            .layout();
        return l.custodianDelegates[custodian];
    }

    function _delegateEnableInvestorToWhitelist(address investor_, address delegator) internal {
        require(investor_ != address(0), "investor address cannot be zero");
        InvestorManagementStorage.Layout storage l = InvestorManagementStorage
            .layout();

        require(_isCustodianDelegate(delegator, _msgSender()), "Caller must be a custodian delegate");

        _enableInvestor(investor_, delegator);
    }

    function _delegateDisableInvestorFromWhitelist(address investor_) internal {
        require(investor_ != address(0), "investor address cannot be zero");
        InvestorManagementStorage.Layout storage l = InvestorManagementStorage
            .layout();
        
        require(_isCustodianDelegate(delegator, _msgSender()), "Caller must be a custodian delegate");
        require(
            l.investorInfos[investor_].custodian == delegator,
            "only the custodian can disallow the investor"
        );
        l.investorInfos[investor_].allowed = false;

        emit DisableInvestor(investor_);
    }
}
