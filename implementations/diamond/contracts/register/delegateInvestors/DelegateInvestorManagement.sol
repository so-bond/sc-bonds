// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

import { IDelegateInvestorManagement } from "./IDelegateInvestorManagement.sol";
import { DelegateInvestorManagementInternal } from "./DelegateInvestorManagementInternal.sol";

contract DelegateInvestorManagement is IDelegateInvestorManagement, DelegateInvestorManagementInternal {
    /**
     * @inheritdoc IDelegateInvestorManagement
     */
    function setCustodianDelegate(
        address delegate
    ) public {
        _setCustodianDelegate(delegate);
    };

    /**
     * @inheritdoc IDelegateInvestorManagement
     */
    function unsetCustodianDelegate() public {
        _unsetCustodianDelegate();
    }

    /**
     * @inheritdoc IDelegateInvestorManagement
     */
    function isCustodianDelegate(address custodian, address delegate) public view returns (bool) {
        return _isCustodianDelegate(custodian, delegate);
    }

    /**
     * @inheritdoc IDelegateInvestorManagement
     */
    function getCustodianDelegate(address custodian) public view returns (address memory) {
        return _getCustodianDelegate(custodian);
    }

    /**
     * @inheritdoc IDelegateInvestorManagement
     */
    function delegateEnableInvestorToWhitelist(address investor_, address delegator) public {
        _delegateEnableInvestorToWhitelist(investor_);
    }

    /**
     * @inheritdoc IDelegateInvestorManagement
     */
    function delegateDisableInvestorFromWhitelist(address investor_, address delegator) public {
        _delegateDisableInvestorFromWhitelist(investor_);
    }
}