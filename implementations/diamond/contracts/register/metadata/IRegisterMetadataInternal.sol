// SPDX-License-Identifier: MIT
// FeverTokens Contracts v1.0.0

pragma solidity ^0.8.17;

interface IRegisterMetadataInternal {
    /**
     * @notice Status of the bond
     */
    enum Status {
        Draft,
        Ready,
        Issued,
        Repaid,
        Frozen
    }

    /**
     * @notice Bond data
     * @param name The name of the bond
     * @param isin The ISIN of the bond
     * @param expectedSupply The expected supply
     * @param currency The currency
     * @param unitValue The unit value
     * @param couponRate The coupon rate
     * @param creationDate The creation date
     * @param issuanceDate The issuance date
     * @param maturityDate The maturity date
     * @param couponDates The coupon dates
     * @param cutOffTime The cut off time
     */
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

    /**
     * @notice Emitted when a new bond is drafted
     * @param creator The creator
     * @param name The name of the bond
     * @param isin The ISIN of the bond
     */
    event NewBondDrafted(address indexed creator, string name, string isin); //FIXME: remove this and replace by RegisterStatusChanged

    /**
     * @notice Emitted when the status of the register changes
     * @param emiter The emiter
     * @param name The name of the bond
     * @param isin The ISIN of the bond
     * @param status The status
     */
    event RegisterStatusChanged(
        address indexed emiter,
        string name,
        string isin,
        Status status
    );

    /**
     * @notice Emitted when a public message is sent
     * @param sender The sender
     * @param target The target
     * @param message The message
     */
    event PublicMessage(
        address indexed sender,
        address indexed target,
        string message
    );
}
