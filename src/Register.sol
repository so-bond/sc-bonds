// SPDX-License-Identifier: MIT
// SATURN project (last updated v0.1.0)

pragma solidity 0.8.17;

import "./intf/IRegister.sol";
import "./RegisterRoleManagement.sol";
import "./CouponSnapshotManagement.sol";
import "./SmartContractAccessManagement.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Arrays.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/utils/Strings.sol";
/**
 * @dev This contract is based on ERC20 standard
 *
 * Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */

contract Register is
    Context,
    RegisterRoleManagement,
    CouponSnapshotManagement,
    SmartContractAccessManagement,
    IRegister
{
    // mapping of an address to the custodian address or none if not listed
    mapping(address => InvestorInfo) private _investorInfos;
    address[] private _investorsList;

    Status public status;
    BondData private _data;

    //TODO: refactor: keep _ notation for internal members
    address public _primaryIssuanceAccount = address(this);

    /**
     * Term sheet data
        Bond Description (text string limited to a reasonable nb of characters)
        Symbol (XS ISIN code)
        Currency (ISO 3 char code)
        Decimal representation = 0 --> we use the decimal variable of ERC20
        Facial value in Currency of a unit of the bond (Denomination)
        Total issued bond
        Creation date
        Issuance date
        Delivery date
        Coupon dates as an array of dates (a schedule) when coupons will be paid
        Repayment date
     */

    /**
     * @dev Sets the values for bond initial metadata.
     *
     * The default value of {decimals} is 0.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     *
     * The first address of the contract needs to have the role DEFAULT_ADMIN_ROLE -
     * which is super role - can GRANT and REVOKE roles
     * see https://docs.openzeppelin.com/contracts/4.x/access-control
     *
     * When contract deploys, CAK gets DEFAULT_ADMIN_ROLE, CAK_ROLE and is admin of all others roles
     */
    constructor(
        string memory name_,
        string memory isin_,
        uint256 expectedSupply_,
        bytes32 currency_,
        uint256 unitVal_,
        uint256 couponRate_,
        uint256 creationDate_,
        uint256 issuanceDate_,
        uint256 maturityDate_,
        uint256[] memory couponDates_,
        uint256 cutofftime_
    ) ERC20(name_, isin_) {
        //  emit Debug("start constructor", couponDates_.length,0, gasleft());
        _data.name = name_;
        _data.isin = isin_;
        _data.expectedSupply = expectedSupply_;
        _data.currency = currency_;
        _data.unitValue = unitVal_;
        _data.couponRate = couponRate_;
        _data.creationDate = creationDate_;
        _data.issuanceDate = issuanceDate_;
        _data.maturityDate = maturityDate_;
        _data.couponDates = couponDates_;
        _data.cutOffTime = cutofftime_;
        
        // emit Debug("before coupon init", couponDates_.length,0, gasleft());
        _initCurrentCoupon();
        // emit Debug("after coupon init", 0,0, gasleft());

        status = Status.Draft;
        emit NewBondDrafted(msg.sender, name_, isin_);
        emit RegisterStatusChanged(msg.sender, _data.name, _data.isin, status);

        // emit Debug("end of constructor", 0,0, gasleft());
    }


    /**
     * @dev Return true if the caller is allowed to manage the smart contracts
     *     Overrides the definition in SmartContractAccessManagement
     */
    function canManageSmartContracts() internal view override returns (bool) {
        return hasRole(CAK_ROLE, msg.sender);
    }

    /**
     * @dev Returns the name of the token.
     */
    function name()
        public
        view
        virtual
        override(ERC20, IERC20Metadata)
        returns (string memory)
    {
        return _data.name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol()
        public
        view
        virtual
        override(ERC20, IERC20Metadata)
        returns (string memory)
    {
        return _data.isin;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * This contract represents an issued Bond composed of an integer number of parts,
     * hence no fractional representation is allowed: decimal is zero.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals()
        public
        view
        virtual
        override(ERC20, IERC20Metadata)
        returns (uint8)
    {
        return 0;
    }

    /**
     * @dev the aim of this function is to inform the contract Exchange of the address which receives the minted tokens
     */
    function primaryIssuanceAccount()
        public
        view
        virtual
        override
        returns (address)
    {
        return _primaryIssuanceAccount;
    }

    /**
     * @dev The aim of this function is to set the name of this contract
     */
    function setName(string memory name_) public {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        _data.name = name_;
    }

    /**
     * @dev check whether investor is allowed for transfer (whitelisting)
     */
    function investorsAllowed(address investor)
        public
        view
        override
        returns (bool)
    {
        return _investorInfos[investor].allowed;
    }

    /**
     * @dev Returns the custodian for a given investor.
     */
    function investorCustodian(address investor)
        public
        view
        override
        returns (address)
    {
        return _investorInfos[investor].custodian;
    }

    /**
     * @dev Returns the list of investors for whom whitelisting status was set at least once for this bond.
     * They may be authorized or not to transfer funds.
     * If in this list, an investor is not necessarily allowed to transfer funds, see InvestorInfo for that.
     */
    function getAllInvestors() public view override returns (address[] memory) {
        return _investorsList;
    }

    /**
     * @dev called by _enebaleInvestor and the primary issuance to defined the BnD
     */
    function _initInvestor(address investor_, address custodian_, bool allowed) internal {
        uint256 index = _investorsList.length;
        _investorsList.push(investor_);
        _investorInfos[investor_].index = index;
        _investorInfos[investor_].investor = investor_;
        _investorInfos[investor_].custodian = custodian_;
        _investorInfos[investor_].allowed = allowed;
    }
    /**
     * @dev called by enableInvestorToWhitelist 
     */
    function _enableInvestor(address investor_, address custodian_) internal {
        if (investorsAllowed(investor_)) {
            //since _enableInvestor is called upon each transferFrom, do nothing if already enabled
            return;
        }

        bool isNew = _investorInfos[investor_].custodian == address(0);
        if (isNew) {
            // first whitelisting
            _initInvestor(investor_, custodian_, true);
        } else {
            //only investor's custodian may re-enable the investor state
            require(
                _investorInfos[investor_].custodian == custodian_,
                "only the custodian can disallow the investor"
            );
            _investorInfos[investor_].allowed = true;
        }
        emit EnableInvestor(investor_);
    }

    /**
     * @dev Allow investor's address (enabling transfer of for this address)
     */
    function enableInvestorToWhitelist(address investor_) public override {
        require(investor_ != address(0), "investor address cannot be zero");
        bool isNew = _investorInfos[investor_].custodian == address(0);

        //CAK may edit investor allowed status if whitelisting exist.
        if (hasRole(CAK_ROLE, msg.sender)) {
            require(!isNew, "investor must be set up first");
            _investorInfos[investor_].allowed = true;
            return;
        }

        require(hasRole(CST_ROLE, msg.sender), "Caller must be CST");

        _enableInvestor(investor_, msg.sender);
    }

    /**
     * @dev Disallow an investor address (transfer will be denied). Note that the address remains in the _investorsList.
     */
    function disableInvestorFromWhitelist(address investor_) public override {
        require(investor_ != address(0), "investor address cannot be zero");

        //CAK may edit investor allowed status if whitelisting exist.
        if (hasRole(CAK_ROLE, msg.sender)) {
            require(
                _investorInfos[investor_].custodian != address(0),
                "investor must be set up first"
            );
            _investorInfos[investor_].allowed = false;
            return;
        }

        require(hasRole(CST_ROLE, msg.sender), "Caller must be CST");
        require(
            _investorInfos[investor_].custodian == msg.sender,
            "only the custodian can disallow the investor"
        );
        _investorInfos[investor_].allowed = false;

        emit DisableInvestor(investor_);
    }

    function getInvestorListAtCoupon(uint256 CouponDate)
        public
        view
        override
        returns (address[] memory)
    {
        //TODO: consistency check: do we have to iterate on whitelisted investors only ? if yes then change implementation

        // 1. Lister les investisseurs
        address[] memory _investor = new address[](_investorsList.length);

        uint256 arrayLength = 0;

        for (uint256 i = 0; i < _investorsList.length; i++) {
            if (balanceOfCoupon(_investorsList[i], CouponDate) > 0) {
                _investor[arrayLength] = _investorsList[i];
                arrayLength++;
            }
        }
        address[] memory _investorResult = new address[](arrayLength);
        for (uint256 i = 0; i < arrayLength; i++) {
            _investorResult[i] = _investor[i];
        }
        // 3. Return list of
        return (_investorResult);
    }

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
        uint256 cutofftime_
    ) public override {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        //FIXME: add lifecyle check
        if (_data.couponDates.length>0) {
            require(_data.couponDates[0] > issuanceDate_, "Cannot set a issuance date after the first coupon date");
            require(_data.couponDates[_data.couponDates.length-1] < maturityDate_, "Cannot set a maturity date before the last coupon date");
        }

        _data.name = name_;
        _data.expectedSupply = expectedSupply_;
        _data.currency = currency_;
        _data.unitValue = unitVal_;
        _data.couponRate = couponRate_;
        // _data.creationDate = creationDate_;
        _data.issuanceDate = issuanceDate_;
        _data.maturityDate = maturityDate_;
        // _data.couponDates = couponDates_;
        _data.cutOffTime = cutofftime_;
    }

    function addCouponDate(uint256 date) public override {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        require(date > _data.issuanceDate, "Cannot set a coupon date smaller or equal to the issuance date");
        require(date < _data.maturityDate, "Cannot set a coupon date greater or equal to the maturity date");
        (uint256 index, bool found) = findCouponIndex(date);
        if (!found) { 
            require(_canInsertCouponDate(date), "Cannot insert this date, it is in the past");
            // need to move the items up and insert the item
            if (_data.couponDates.length > 0) {
                _data.couponDates.push(_data.couponDates[_data.couponDates.length-1]);
                // now length has one more so length-2 is the previous latest element
                if (_data.couponDates.length >= 3) { // we had at least 2 elements before so perform the copy
                    for (uint256 i=_data.couponDates.length-3; i>=index; i--) {
                        _data.couponDates[i+1] = _data.couponDates[i];
                        if (i==0) break;
                    }
                }
                // now add the new item
                _data.couponDates[index] = date;
            } else { // there was no item initially, so add the new item
                _data.couponDates.push(date);
            }
            // ensure adding this date in the coupons will update the snapshot preparation properly
            _initCurrentCoupon();
        } // the coupon already exists do nothing
    }
    function delCouponDate(uint256 date) public override {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        (uint256 index, bool found) = findCouponIndex(date);
        if (found) { // the index represents the position where the date is present
            require(_canDeleteCouponDate(date), "This coupon date cannot be deleted");
            if (index<_data.couponDates.length-1) {
                for (uint256 i=index; i<_data.couponDates.length-1; i++) {
                    _data.couponDates[i] = _data.couponDates[i+1];
                }
            }
            _data.couponDates.pop(); // remove the last item that can be the index item or not
            _initCurrentCoupon();
        } // else not found so no need to delete
    }

    function _initCurrentCoupon() private {
        // first find the date that directly follows the current block
        (uint256 index,) = findCouponIndex(block.timestamp);
        uint256 current = 0;
        uint256 next = 0;
        if (index<_data.couponDates.length) {
            current = _data.couponDates[index];
            if (index+1<_data.couponDates.length) {
                next = _data.couponDates[index+1];
            } else {
                next = _data.maturityDate;
            }
        } else {
            current = _data.maturityDate;
            next = 0;
        }
        // emit Debug("_initCurrentCoupon", index, current, gasleft());
        _updateSnapshotTimestamp(current, current+_data.cutOffTime, next);
    }

    function getBondData() public view override returns (BondData memory) {
        return _data;
    }

    function getBondCouponRate() public view override returns (uint256) {
        return _data.couponRate;
    }

    function getBondUnitValue() public view override returns (uint256) {
        return _data.unitValue;
    }

    /**
     * @dev The aim of this function is to set the ISIN Symbol of the registar
     */
    function setIsinSymbol(string memory isinSymbol_) public override {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        _data.isin = isinSymbol_;
    }

    /**
     * @dev The aim of this function is to set the currency of the registar
     */
    function setCurrency(bytes32 currency_) public override onlyRole(CAK_ROLE) {
        _data.currency = currency_;
    }

    function getCreationDate() public view override returns (uint256) {
        return _data.creationDate;
    }

    function getIssuanceDate() public view override returns (uint256) {
        return _data.issuanceDate;
    }

    /**
     * @dev The aim of this function is to set the creation date of the registar
     */
    function setCreationDate(uint256 creationDate_) public override {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        _data.creationDate = creationDate_;
    }

    /**
     * @dev The aim of this function is to set the issuance date of the registar
     */
    function setIssuanceDate(uint256 issuanceDate_) public override {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        _data.issuanceDate = issuanceDate_;
    }


    /**
     * @dev this function is called by Coupon.sol when Paying Agent validates the coupon Date.
     */
    function setCurrentCouponDate(uint256 couponDate_, uint256 recordDatetime_)
        external
        override
    {
        //TODO: rename this to setCurrentSnapshotDateTime()
        bytes32 hash = atReturningHash(msg.sender);
        require(_contractsAllowed[hash], "This contract is not whitelisted"); //can be called only by Coupon smart contract
        require( recordDatetime_+(10*24*3600) > couponDate_, "Inconsistent record date more than 10 days before settlement date");
        _setCurrentSnapshotDatetime(
            couponDate_,
            recordDatetime_,
            _nextCouponDate(couponDate_)
        );
    }

    function toggleFrozen() external override {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        if (status == Status.Issued) {
            status = Status.Frozen;
        } else if (status == Status.Frozen) {
            status = Status.Issued;
        } else 
        require(false, "Cannot Freeze / Unfreeze the register as the status is not Issued or Frozen");

        emit RegisterStatusChanged(
            msg.sender,
            _data.name,
            _data.isin,
            status);
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(
        address, /*to_*/
        uint256 /*amount_*/
    ) public virtual override(ERC20, IERC20) returns (bool) {
        revert("transfer is disabled");
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(
        address, /*spender_*/
        uint256 /*amount_*/
    ) public virtual override(ERC20, IERC20) returns (bool) {
        revert("approve is disabled");
    }

    /**
     * @dev
     * this function can be called by a CAK or an authorized smart contract (see mapping _contractsAllowed)
     * if called by the CAK, then the transfer is done
     * if called by an authorized smart contract, the transfer is done
     */
    function transferFrom(
        address from_,
        address to_,
        uint256 amount_
    ) public virtual override(ERC20, IERC20) returns (bool) {
        //FIXME: redemption:  if currentTS==0 deny all  (returns false) transfer except if TO= PrimaryIssuanceAccount
        /** @dev if sender is CAK then any transfer is accepted */
        if (hasRole(CAK_ROLE, msg.sender)) {
            _transfer(from_, to_, amount_);
            return true;
        } else { // Not called directly from a CAK user
            /** @dev enforce caller contract is whitelisted */
            bytes32 hash = atReturningHash(msg.sender);
            require(
                _contractsAllowed[hash],
                "This contract is not whitelisted"
            );

            require(status != Status.Frozen, "No transfer can be done when the register is Frozen");


            // Additional checks depending on the situation

            // If we are called by the BnD / PrimaryIssuance smart contract
            // Note: B&D wallet is only usable for the initial purchase and then the primary sell  
            // we can change the status of the register, BnD wallet will not be whitelisted
            if (status == Status.Ready 
                && hasRole(BND_ROLE, to_)
                && from_ == _primaryIssuanceAccount) {
                status = Status.Issued;
                // Change: We do not enable the B&D as investor to prevent the B&D to receive securities later 
                // but we still need the BnD to be declared as an investor
                _initInvestor(to_, address(0), false);

                emit RegisterStatusChanged(
                    msg.sender,
                    _data.name,
                    _data.isin,
                    status
                );
            } else {
                // standard case 

                //make sure the recipient is an allowed investor
                require(
                    investorsAllowed(to_) == true,
                    "The receiver is not allowed"
                );

                require(
                    investorsAllowed(from_) == true // the seller must be a valid investor at the time of transfer
                    || hasRole(BND_ROLE, from_), // or the seller is the B&D for the primary distribution
                    "The sender is not allowed"
                );

            }

            _transfer(from_, to_, amount_);
            return true;
        }
    }

    function returnBalanceToPrimaryIssuanceAccount(address investor) public override returns (bool) {
        // can only be called by allowed smart contract (typically the redemption contrat)
        /** @dev enforce caller contract is whitelisted */
        bytes32 hash = atReturningHash(msg.sender);
        require(
            _contractsAllowed[hash],
            "This contract is not whitelisted"
        );
        //make sure the investor is an allowed investor
        require(
            investorsAllowed(investor) == true,
            "The investor is not whitelisted"
        );
        // ensure the transfer only happens when the current time is after the maturity cut of time
        uint256 couponDate = this.currentCouponDate();
        require (
            (couponDate == _data.maturityDate || couponDate == 0) 
            && block.timestamp > this.currentSnapshotDatetime(),
            "returning the balance to the primary issuance can only be done after the maturity cut off time"
        );
        uint256 balance = this.balanceOf(investor);
        require (balance>0, "no balance to return for this investor");
        _forceNextTransfer(); // make the _beforeTokenTransfer control ignore the end of life of the bond
        _transfer(investor, primaryIssuanceAccount(), balance);
        return true;
    }

    /**
     * @dev a.k.a issued quantity: set the amount of tokens minted when makeReady() is called.
     */
    function setExpectedSupply(uint256 expectedSupply_)
        public
        virtual
        override
    {
        require(hasRole(CAK_ROLE, msg.sender), "Caller must be CAK");
        require(
            status == Status.Draft,
            "lifecycle violation - only allowed when status is in draft"
        );
        _data.expectedSupply = expectedSupply_;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(
        address, /*spender_*/
        uint256 /*addedValue_*/
    ) public virtual override returns (bool) {
        revert("increaseAllowance is disabled");
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(
        address, /*spender_*/
        uint256 /*subtractedValue_*/
    ) public virtual override returns (bool) {
        revert("decreaseAllowance is disabled");
    }

    /**
     * @dev The aim of this function is to enable the CAK to mint some bond units
     */
    function mint(uint256 amount_) public {
        require((hasRole(CAK_ROLE, msg.sender)), "Caller must be CAK");
        require(
            address(_primaryIssuanceAccount) != address(0x0),
            "You must set the mint receiver address"
        );
        _mint(_primaryIssuanceAccount, amount_);
    }

    /**
     * @dev Initialize the total amount definitively and freeze the register attributes.
     * Takes the expected supply to mint to the security issuance account and set the status to Ready.
     */
    function makeReady() public {
        require((hasRole(CAK_ROLE, msg.sender)), "Caller must be CAK");
        require(status == Status.Draft, "Register should be in Draft state");
        require(_data.expectedSupply > 0, "expected supply cannot be zero");
        require(
            address(_primaryIssuanceAccount) != address(0x0),
            "You must set the mint receiver address"
        );
        _mint(_primaryIssuanceAccount, _data.expectedSupply);
        status = Status.Ready;
        emit RegisterStatusChanged(msg.sender, _data.name, _data.isin, status);
    }
    
    /**
     * @dev In case of an error detected after the bond was made ready but before it was issued
     * place the bond back to draft mode
     */
    function revertReady() public {
        require((hasRole(CAK_ROLE, msg.sender)), "Caller must be CAK");
        require(status == Status.Ready, "Register should be in Ready state");
        _burn(_primaryIssuanceAccount, _data.expectedSupply);
        status = Status.Draft;
        emit RegisterStatusChanged(msg.sender, _data.name, _data.isin, status);
    }


    /**
     * @dev This function intent to allow institutions to communicate between them
     */
    function publicMessage(address to, string memory message) public {
        require( hasRole(CAK_ROLE, msg.sender)
                || hasRole(BND_ROLE, msg.sender)
                || hasRole(CST_ROLE, msg.sender)
                || hasRole(PAY_ROLE, msg.sender)
        , "The caller must have a role in the transaction");
        emit PublicMessage(msg.sender, to, message);
    }
    /**
     * @dev The aim of this function is to enable the CAK or IP to burn some bond units
     */
    function burn(uint256 amount_) public {
        require((hasRole(CAK_ROLE, msg.sender)), "Caller must be CAK");
        _forceNextTransfer(); // make the _beforeTokenTransfer ignore that we are at the end of the bond
        _burn(_primaryIssuanceAccount, amount_);

        // Raises a slither warning on https://github.com/crytic/slither/wiki/Detector-Documentation#dangerous-strict-equalities
        // But this is an accepted situation as we want to reach zero exactly
        if (balanceOf(_primaryIssuanceAccount) == 0 && totalSupply() == 0) {
            status = Status.Repaid;
            emit RegisterStatusChanged(msg.sender, _data.name, _data.isin, status);
        }
    }

/** Will return the index where the date can be inserted and if the date exists */
    function findCouponIndex(uint256 _couponDate)
        internal
        view
        returns (uint256 index, bool found)
    {
        // Works on the assumption that the list of coupons dates are sorted
        for (uint256 i = 0; i < _data.couponDates.length; i++) {
            // Raises a slither warning on https://github.com/crytic/slither/wiki/Detector-Documentation#dangerous-strict-equalities
            // But this is an accepted situation as we need to compare the provided date with the array
            if (_data.couponDates[i] == _couponDate) {
                return (i, true);
            } else if (_data.couponDates[i]>_couponDate) { // we wont find a coupon now that 
                return (i, false); 
            }
        }
        return (_data.couponDates.length, false);
    }

    function checkIfCouponDateExists(uint256 _couponDate)
        public
        view
        returns (bool)
    {
        (, bool found) = findCouponIndex(_couponDate);
        if (found) return true;
        if (_data.maturityDate == _couponDate) return true;
        return false;
    }

    function checkIfMaturityDateExists(uint256 _maturityDate)
        external
        view
        returns (bool)
    {
        return _data.maturityDate == _maturityDate;
    }

    /*
     * Find the next couponDate, that is the one which is just after the current one;
     * returns 0 if not found or nextDate does not exist.
     */
    function _nextCouponDate(uint256 current) private view returns (uint256) {
        //TODO: use the findCouponIndex instead
        for (uint256 index = 0; index < _data.couponDates.length; index++) {
            if (_data.couponDates[index] == current) {
                //if next exist then return it
                if (index + 1 < _data.couponDates.length) {
                    return _data.couponDates[index + 1];
                } else {
                    return _data.maturityDate;
                }
            }
        }

        return 0;
    }

    function _beforeTokenTransfer(
        address from_,
        address to_,
        uint256 amount_
    ) internal virtual override {
        require(status != Status.Repaid, "the Register is closed");
        
        super._beforeTokenTransfer(from_, to_, amount_);
    }
}
