// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

interface IRegisterMetadata {
    struct BondData {
        string name;
        string isin;
        uint256 expectedSupply; //set by CAK, is the number of unit of bond - the minted amount when CAK calls makeReady()
        //TODO: currency vs erc20 symbol ? same thing ?
        bytes32 currency; //currency as 3 characters ISO code (SEK by default, no combo box needed)
        uint256 unitValue; //value of 1 unit of bond in currency
        uint256 couponRate; //percentage of interests per year (eg 0.25%). It represents the amount to be paid by the Issuer on a yearly basis at anniversary date of the issuance and is calculated by A = Principal * YearlyRate, where A is the coupon amount, Principal is the nominal value of all the bonds units and the YearlyRate the value captured here.
        uint256 creationDate; //Actually the date of clicking the finalization, can be set by the smart contract automatically
        uint256 issuanceDate; //The actual date of issuance (when the bond start to exists legally speaking)
        uint256 maturityDate; //The expected date in the future for the repayment by the issuer - should be issuance date + N years
        uint256[] couponDates; //An array of dates, as anniversary dates of the issuance until maturity (excluded). For instance, if the bond is issued on the 10/10/2022 with a 3 years maturity, we shall expect 2 coupon dates: 10/10/2023, 10/10/2024
        uint256 cutOffTime; //the time part of the coupon snapshot (must be lower than 24*300 sec)
    }

    function setIsinSymbol(string memory isinSymbol) external;

    function setCurrency(bytes32 currency) external;

    function getCreationDate() external view returns (uint256);

    function getIssuanceDate() external view returns (uint256);

    function setCreationDate(uint256 creationDate) external;

    function setIssuanceDate(uint256 issuanceDate) external;

    function setBondData(
        string memory name_,
        uint256 expectedSupply_,
        bytes32 currency_,
        uint256 unitVal_,
        uint256 couponRate_,
        // uint256 creationDate_,
        uint256 issuanceDate_,
        uint256 maturityDate_,
        // uint256[] memory couponDates_,
        uint256 cutOffTime_
    ) external;

    function addCouponDate(uint256 date) external;
    function delCouponDate(uint256 date) external;

    function setExpectedSupply(uint256 expectedSupply) external;

    function getBondData() external view returns (BondData memory);

    function getBondCouponRate() external view returns (uint256);

    function getBondUnitValue() external view returns (uint256);
}
