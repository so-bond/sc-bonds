// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.20;

interface IRegisterMetadataInternal {
    enum Status {
        Draft,
        Ready,
        Issued,
        Repaid,
        Frozen
    }
    struct BondData {
        string name;
        string isin;
        uint256 expectedSupply; /// @dev set by CAK, is the number of unit of bond - the minted amount when CAK calls makeReady()
        bytes32 currency; /// @dev currency as 3 characters ISO code (SEK by default, no combo box needed)
        uint256 unitValue; /// @dev value of 1 unit of bond in currency
        uint256 couponRate; /// @dev percentage of interests per year (eg 0.25%). It represents the amount to be paid by the Issuer on a yearly basis at anniversary date of the issuance and is calculated by A = Principal * YearlyRate, where A is the coupon amount, Principal is the nominal value of all the bonds units and the YearlyRate the value captured here.
        uint256 creationDate; /// @dev Actually the date of clicking the finalization, can be set by the smart contract automatically
        uint256 issuanceDate; /// @dev The actual date of issuance (when the bond start to exists legally speaking)
        uint256 maturityDate; /// @dev The expected date in the future for the repayment by the issuer - should be issuance date + N years
        uint256[] couponDates; /// @dev An array of dates, as anniversary dates of the issuance until maturity (excluded). For instance, if the bond is issued on the 10/10/2022 with a 3 years maturity, we shall expect 2 coupon dates: 10/10/2023, 10/10/2024
        uint256 cutOffTime; /// @dev The time part of the coupon snapshot (must be lower than 24*300 sec)
    }

    struct InvestorInfo {
        address investor; //TODO: de-normalisation maybe not needed
        bool allowed; // true if investor whitelisted for transfer
        uint256 index; // zero-based index on investor list
        address custodian;
    }

    event WalletAddedToWhitelist(address indexed toBeAdded);

    event WalletDeletedFromWhitelist(address indexed toBeDeleted);

    event EnableInvestor(address investor);

    event DisableInvestor(address investor);

    event NewBondDrafted(address indexed creator, string name, string isin); //FIXME: remove this and replace by RegisterStatusChanged

    event RegisterStatusChanged(
        address indexed emiter,
        string name,
        string isin,
        Status status
    );

    event PublicMessage(
        address indexed sender,
        address indexed target,
        string message
    );
}
