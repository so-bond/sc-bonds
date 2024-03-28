// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

import { IInvestorManagement } from "./IInvestorManagement.sol";
import { InvestorManagementInternal } from "./InvestorManagementInternal.sol";

contract InvestorManagement is IInvestorManagement, InvestorManagementInternal {
    /**
     * @inheritdoc IInvestorManagement
     */
    function getAllInvestors() public view returns (address[] memory) {
        return _getAllInvestors();
    }

    /**
     * @inheritdoc IInvestorManagement
     */
    function disableInvestorFromWhitelist(address investor_) public {
        _disableInvestorFromWhitelist(investor_);
    }

    ///@inheritdoc IInvestorManagement
    function enableInvestorToWhitelist(address investor_) public {
        _enableInvestorToWhitelist(investor_);
    }

    function investorsAllowed(address investor) public view returns (bool) {
        return _investorsAllowed(investor);
    }

    /**
     * @inheritdoc IInvestorManagement
     */
    function investorCustodian(address investor) public view returns (address) {
        return _investorCustodian(investor);
    }
}
