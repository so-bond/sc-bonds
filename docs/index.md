# Solidity API

## BilateralTrade

### register

```solidity
contract IRegister register
```

### status

```solidity
enum ITrade.Status status
```

### sellerAccount

```solidity
address sellerAccount
```

### details

```solidity
struct ITrade.TradeDetail details
```

### constructor

```solidity
constructor(contract IRegister _register, address _buyer) public
```

_When the smart contract deploys:
- we check that deployer has been whitelisted
- we check that buyer has been whitelisted
- we map the register contract to interact with it
- variable sellerAccount gets msg.sender address
- details struct buyer gets buyer address
- status of current contract is Draft

The constructor cannot be checked by the register by looking ain the hash of
the runtime bytecode because this hash does not cover the constructor.
so controls in the constructors are to be replicated in the first interaction with a function_

### buyerAccount

```solidity
function buyerAccount() public view returns (address)
```

_gets the buyer address_

### paymentID

```solidity
function paymentID() public view returns (bytes8)
```

_produces a unique payiment identifier_

### setDetails

```solidity
function setDetails(struct ITrade.TradeDetail _details) public
```

_enables the sellerAccount address to update the bilateral trade detail
can be called only if status of current contract is Draft
     can be called only if buyer updated is whitelisted_

### getDetails

```solidity
function getDetails() public view returns (struct ITrade.TradeDetail)
```

_gets the bilateral trade details_

### approve

```solidity
function approve() public returns (enum ITrade.Status)
```

_enables the approval of the bilateral trade in 2 steps :
1) caller is seller account address and smart contract is in status Draft
--> status becomes Pending and emits an event
2) Caller is buyer account address and smart contract is in status Pending
--> transfer the tokens from B&D account to buyer
--> status becomes Accepted and emits an event_

### reject

```solidity
function reject() public
```

_enables the rejection of the bilateral trade in 2 possibilites :
1) caller is seller account address and smart contract is in status Draft or Pending
--> status becomes Rejected and emits an event
2) Caller is buyer account address and smart contract is in status Pending
--> status becomes Rejected and emits an event_

### executeTransfer

```solidity
function executeTransfer() public returns (bool)
```

## Coupon

### CouponStatus

```solidity
enum CouponStatus {
  Draft,
  Ready,
  Cancelled,
  Closed,
  Finalized
}
```

### PaymentStatus

```solidity
enum PaymentStatus {
  ToBePaid,
  Paid,
  PaymentReceived
}
```

### CouponChanged

```solidity
event CouponChanged(contract IRegister register, uint256 couponDate, enum Coupon.CouponStatus status)
```

### CouponPaymentStatusChanged

```solidity
event CouponPaymentStatusChanged(contract IRegister register, uint256 couponDate, address investor, enum Coupon.PaymentStatus status, enum Coupon.PaymentStatus previousStatus)
```

### couponDate

```solidity
uint256 couponDate
```

### nbDays

```solidity
uint256 nbDays
```

### recordDate

```solidity
uint256 recordDate
```

### cutOfTime

```solidity
uint256 cutOfTime
```

### payingAgent

```solidity
address payingAgent
```

### actualTimestamp

```solidity
uint256 actualTimestamp
```

### register

```solidity
contract IRegister register
```

### register2

```solidity
contract ICouponSnapshotManagement register2
```

### status

```solidity
enum Coupon.CouponStatus status
```

### investorPayments

```solidity
mapping(address => enum Coupon.PaymentStatus) investorPayments
```

### constructor

```solidity
constructor(address _registerContract, uint256 _couponDate, uint256 _nbDays, uint256 _recordDate, uint256 _cutOfTime) public
```

This contract must be authorized in the register to interact with it
The constructor cannot be checked by the register by looking ain the hash of
the runtime bytecode because this hash does not cover the constructor.
so controls in the constructors are to be replicated in the first interaction with a function

### onlyPAY_ROLE

```solidity
modifier onlyPAY_ROLE()
```

_Throws if called by any account other than the PAY_ROLE._

### onlyCST_ROLE

```solidity
modifier onlyCST_ROLE()
```

### getInvestorPayments

```solidity
function getInvestorPayments(address _investor) public view returns (enum Coupon.PaymentStatus)
```

### paymentIdForInvest

```solidity
function paymentIdForInvest(address _investor) external view returns (bytes8)
```

### setDateAsCurrentCoupon

```solidity
function setDateAsCurrentCoupon() public
```

_this method interacts with the register it is linked to and sets the rgister current coupon date and timestamp_

### setNbDays

```solidity
function setNbDays(uint256 _nbDays) public
```

### setCutOffTime

```solidity
function setCutOffTime(uint256 _recordDate, uint256 _cutOfTime) public
```

### rejectCoupon

```solidity
function rejectCoupon() public
```

### getPaymentAmountForInvestor

```solidity
function getPaymentAmountForInvestor(address _investor) public view returns (uint256 paymentAmount)
```

### getTotalPaymentAmount

```solidity
function getTotalPaymentAmount() public view returns (uint256 paymentAmount)
```

### toggleCouponPayment

```solidity
function toggleCouponPayment(address _investor) public
```

## CouponSnapshotManagement

### SnapshotTimestampChange

```solidity
event SnapshotTimestampChange(uint256 couponDate, uint256 currentTimestamp, uint256 nextTimestamp)
```

### currentSnapshotDatetime

```solidity
function currentSnapshotDatetime() external view returns (uint256)
```

### nextSnapshotDatetime

```solidity
function nextSnapshotDatetime() external view returns (uint256)
```

### currentCouponDate

```solidity
function currentCouponDate() external view returns (uint256)
```

### balanceOfCoupon

```solidity
function balanceOfCoupon(address account, uint256 _couponDate) public view virtual returns (uint256)
```

_Retrieves the balance of `account` at the coupon date that must have been set by the setCurrentCouponDate before._

### totalSupplyAtCoupon

```solidity
function totalSupplyAtCoupon(uint256 _couponDate) public view virtual returns (uint256)
```

_Retrieves the total supply at the coupon date that must have been set by the setCurrentCouponDate before._

### _forceNextTransfer

```solidity
function _forceNextTransfer() internal returns (bool)
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from_, address to_, uint256 amount_) internal virtual
```

_Hook that is called before any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
will be transferred to `to`.
- when `from` is zero, `amount` tokens will be minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens will be burned.
- `from` and `to` are never both zero._

### _updateSnapshotTimestamp

```solidity
function _updateSnapshotTimestamp(uint256 date_, uint256 recordDatetime_, uint256 next_) internal returns (bool)
```

Function update the snapshot based on the provided paratmeters.   
        Will verify if the coupon date needs to be taken as the next timestamp.    
        Assumes that the date_ did not already exists before, so it cannot be the current date / timestamp.   
        Assumes that the call is done after the Register coupons are modified

### _canInsertCouponDate

```solidity
function _canInsertCouponDate(uint256 date_) internal view returns (bool)
```

Cannot insert before the the current date

### _canDeleteCouponDate

```solidity
function _canDeleteCouponDate(uint256 date_) internal view returns (bool)
```

Cannot delete a coupon that has been snapshotted and that is before the current date

### _setCurrentSnapshotDatetime

```solidity
function _setCurrentSnapshotDatetime(uint256 date_, uint256 recordDatetime_, uint256 nextDate_) internal
```

_this function is called by Coupon.sol when Paying Agent validates the coupon Date._

### _makeDatetime

```solidity
function _makeDatetime(uint256 date_, uint256 time_) internal pure returns (uint256 d)
```

## PrimaryIssuance

### register

```solidity
contract IRegister register
```

### account

```solidity
address account
```

### offerPrice

```solidity
uint256 offerPrice
```

### constructor

```solidity
constructor(contract IRegister _register, uint256 _offerPrice) public
```

_when the smart contract deploys :
- we check that deployer has B&D role
- we map the register contract to interact with it
- variable account gets msg.sender address

The constructor cannot be checked by the register by looking ain the hash of
the runtime bytecode because this hash does not cover the constructor.
so controls in the constructors are to be replicated in the first interaction with a function_

### validate

```solidity
function validate() public
```

_the function finalize :
- must be called by contract deployer
- do some actions if balance of Register contract is superior to zero
- if balance of Register contract is superior to zero, transfer the balance to B&D account,
  modify status of currenct contract to Accepted and set the status of Register contract to Issued_

### buyerAccount

```solidity
function buyerAccount() public view returns (address)
```

### sellerAccount

```solidity
function sellerAccount() public view returns (address)
```

### getDetails

```solidity
function getDetails() public view returns (struct ITrade.TradeDetail)
```

### reject

```solidity
function reject() public
```

### paymentID

```solidity
function paymentID() public view returns (bytes8)
```

### status

```solidity
function status() public view returns (enum ITrade.Status)
```

## Redemption

### RedemptionPaymentStatusChanged

```solidity
event RedemptionPaymentStatusChanged(contract IRegister register, uint256 couponDate, address investor, enum Coupon.PaymentStatus status, enum Coupon.PaymentStatus previousStatus)
```

This contract must be authorized in the register to interact with it
The constructor cannot be checked by the register by looking ain the hash of
the runtime bytecode because this hash does not cover the constructor.
so controls in the constructors are to be replicated in the first interaction with a function

### investorRedemptionPayments

```solidity
mapping(address => enum Coupon.PaymentStatus) investorRedemptionPayments
```

### RedemptionChanged

```solidity
event RedemptionChanged(contract IRegister register, uint256 couponDate, enum Coupon.CouponStatus status)
```

### constructor

```solidity
constructor(address _registerContract, uint256 _maturityDate, uint256 _nbDays, uint256 _recordDate, uint256 _cutOfTime) public
```

### getMaturityAmountForInvestor

```solidity
function getMaturityAmountForInvestor(address _investor) public view returns (uint256 paymentAmount)
```

### getTotalMaturityAmount

```solidity
function getTotalMaturityAmount() public view returns (uint256 paymentAmount)
```

### getInvestorRedemptionPayments

```solidity
function getInvestorRedemptionPayments(address _investor) public view returns (enum Coupon.PaymentStatus)
```

### toggleRedemptionPayment

```solidity
function toggleRedemptionPayment(address _investor) public
```

### paymentIdRedemptionForInvest

```solidity
function paymentIdRedemptionForInvest(address _investor) external view returns (bytes8)
```

## Register

_This contract is based on ERC20 standard

Implementation of the {IERC20} interface.

This implementation is agnostic to the way tokens are created. This means
that a supply mechanism has to be added in a derived contract using {_mint}.
For a generic mechanism see {ERC20PresetMinterPauser}.

TIP: For a detailed writeup see our guide
https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
to implement supply mechanisms].

We have followed general OpenZeppelin Contracts guidelines: functions revert
instead returning `false` on failure. This behavior is nonetheless
conventional and does not conflict with the expectations of ERC20
applications.

Additionally, an {Approval} event is emitted on calls to {transferFrom}.
This allows applications to reconstruct the allowance for all accounts just
by listening to said events. Other implementations of the EIP may not emit
these events, as it isn't required by the specification.

Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
functions have been added to mitigate the well-known issues around setting
allowances. See {IERC20-approve}._

### status

```solidity
enum IRegister.Status status
```

### _primaryIssuanceAccount

```solidity
address _primaryIssuanceAccount
```

### constructor

```solidity
constructor(string name_, string isin_, uint256 expectedSupply_, bytes32 currency_, uint256 unitVal_, uint256 couponRate_, uint256 creationDate_, uint256 issuanceDate_, uint256 maturityDate_, uint256[] couponDates_, uint256 cutofftime_) public
```

_Sets the values for bond initial metadata.

The default value of {decimals} is 0.

All two of these values are immutable: they can only be set once during
construction.

The first address of the contract needs to have the role DEFAULT_ADMIN_ROLE -
which is super role - can GRANT and REVOKE roles
see https://docs.openzeppelin.com/contracts/4.x/access-control

When contract deploys, CAK gets DEFAULT_ADMIN_ROLE, CAK_ROLE and is admin of all others roles_

### canManageSmartContracts

```solidity
function canManageSmartContracts() internal view returns (bool)
```

_Return true if the caller is allowed to manage the smart contracts
    Overrides the definition in SmartContractAccessManagement_

### name

```solidity
function name() public view virtual returns (string)
```

_Returns the name of the token._

### symbol

```solidity
function symbol() public view virtual returns (string)
```

_Returns the symbol of the token, usually a shorter version of the
name._

### decimals

```solidity
function decimals() public view virtual returns (uint8)
```

_Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5.05` (`505 / 10 ** 2`).

This contract represents an issued Bond composed of an integer number of parts,
hence no fractional representation is allowed: decimal is zero.

NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}._

### primaryIssuanceAccount

```solidity
function primaryIssuanceAccount() public view virtual returns (address)
```

_the aim of this function is to inform the contract Exchange of the address which receives the minted tokens_

### setName

```solidity
function setName(string name_) public
```

_The aim of this function is to set the name of this contract_

### investorsAllowed

```solidity
function investorsAllowed(address investor) public view returns (bool)
```

_check whether investor is allowed for transfer (whitelisting)_

### investorCustodian

```solidity
function investorCustodian(address investor) public view returns (address)
```

_Returns the custodian for a given investor._

### getAllInvestors

```solidity
function getAllInvestors() public view returns (address[])
```

_Returns the list of investors for whom whitelisting status was set at least once for this bond.
They may be authorized or not to transfer funds.
If in this list, an investor is not necessarily allowed to transfer funds, see InvestorInfo for that._

### _initInvestor

```solidity
function _initInvestor(address investor_, address custodian_, bool allowed) internal
```

_called by _enebaleInvestor and the primary issuance to defined the BnD_

### _enableInvestor

```solidity
function _enableInvestor(address investor_, address custodian_) internal
```

_called by enableInvestorToWhitelist_

### enableInvestorToWhitelist

```solidity
function enableInvestorToWhitelist(address investor_) public
```

_Allow investor's address (enabling transfer of for this address)_

### disableInvestorFromWhitelist

```solidity
function disableInvestorFromWhitelist(address investor_) public
```

_Disallow an investor address (transfer will be denied). Note that the address remains in the _investorsList._

### getInvestorListAtCoupon

```solidity
function getInvestorListAtCoupon(uint256 CouponDate) public view returns (address[])
```

### setBondData

```solidity
function setBondData(string name_, uint256 expectedSupply_, bytes32 currency_, uint256 unitVal_, uint256 couponRate_, uint256 issuanceDate_, uint256 maturityDate_, uint256 cutofftime_) public
```

### addCouponDate

```solidity
function addCouponDate(uint256 date) public
```

### delCouponDate

```solidity
function delCouponDate(uint256 date) public
```

### getBondData

```solidity
function getBondData() public view returns (struct IRegisterMetadata.BondData)
```

### getBondCouponRate

```solidity
function getBondCouponRate() public view returns (uint256)
```

### getBondUnitValue

```solidity
function getBondUnitValue() public view returns (uint256)
```

### setIsinSymbol

```solidity
function setIsinSymbol(string isinSymbol_) public
```

_The aim of this function is to set the ISIN Symbol of the registar_

### setCurrency

```solidity
function setCurrency(bytes32 currency_) public
```

_The aim of this function is to set the currency of the registar_

### getCreationDate

```solidity
function getCreationDate() public view returns (uint256)
```

### getIssuanceDate

```solidity
function getIssuanceDate() public view returns (uint256)
```

### setCreationDate

```solidity
function setCreationDate(uint256 creationDate_) public
```

_The aim of this function is to set the creation date of the registar_

### setIssuanceDate

```solidity
function setIssuanceDate(uint256 issuanceDate_) public
```

_The aim of this function is to set the issuance date of the registar_

### setCurrentCouponDate

```solidity
function setCurrentCouponDate(uint256 couponDate_, uint256 recordDatetime_) external
```

_this function is called by Coupon.sol when Paying Agent validates the coupon Date._

### toggleFrozen

```solidity
function toggleFrozen() external
```

### transfer

```solidity
function transfer(address, uint256) public virtual returns (bool)
```

_See {IERC20-transfer}.

Requirements:

- `to` cannot be the zero address.
- the caller must have a balance of at least `amount`._

### approve

```solidity
function approve(address, uint256) public virtual returns (bool)
```

_See {IERC20-approve}.

NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
`transferFrom`. This is semantically equivalent to an infinite approval.

Requirements:

- `spender` cannot be the zero address._

### transferFrom

```solidity
function transferFrom(address from_, address to_, uint256 amount_) public virtual returns (bool)
```

@dev
this function can be called by a CAK or an authorized smart contract (see mapping _contractsAllowed)
if called by the CAK, then the transfer is done
if called by an authorized smart contract, the transfer is done

### returnBalanceToPrimaryIssuanceAccount

```solidity
function returnBalanceToPrimaryIssuanceAccount(address investor) public returns (bool)
```

### setExpectedSupply

```solidity
function setExpectedSupply(uint256 expectedSupply_) public virtual
```

_a.k.a issued quantity: set the amount of tokens minted when makeReady() is called._

### increaseAllowance

```solidity
function increaseAllowance(address, uint256) public virtual returns (bool)
```

_Atomically increases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address._

### decreaseAllowance

```solidity
function decreaseAllowance(address, uint256) public virtual returns (bool)
```

_Atomically decreases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address.
- `spender` must have allowance for the caller of at least
`subtractedValue`._

### mint

```solidity
function mint(uint256 amount_) public
```

_The aim of this function is to enable the CAK to mint some bond units_

### makeReady

```solidity
function makeReady() public
```

_Initialize the total amount definitively and freeze the register attributes.
Takes the expected supply to mint to the security issuance account and set the status to Ready._

### revertReady

```solidity
function revertReady() public
```

_In case of an error detected after the bond was made ready but before it was issued
place the bond back to draft mode_

### publicMessage

```solidity
function publicMessage(address to, string message) public
```

_This function intent to allow institutions to communicate between them_

### burn

```solidity
function burn(uint256 amount_) public
```

_The aim of this function is to enable the CAK or IP to burn some bond units_

### findCouponIndex

```solidity
function findCouponIndex(uint256 _couponDate) internal view returns (uint256 index, bool found)
```

Will return the index where the date can be inserted and if the date exists

### checkIfCouponDateExists

```solidity
function checkIfCouponDateExists(uint256 _couponDate) public view returns (bool)
```

### checkIfMaturityDateExists

```solidity
function checkIfMaturityDateExists(uint256 _maturityDate) external view returns (bool)
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from_, address to_, uint256 amount_) internal virtual
```

_Hook that is called before any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
will be transferred to `to`.
- when `from` is zero, `amount` tokens will be minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens will be burned.
- `from` and `to` are never both zero._

## RegisterRoleManagement

### registerAdmin

```solidity
address registerAdmin
```

### _votesForNewAdmin

```solidity
uint8 _votesForNewAdmin
```

### _addressForNewAdmin

```solidity
address _addressForNewAdmin
```

### _firstVoterForNewAdmin

```solidity
address _firstVoterForNewAdmin
```

### CAK_ROLE

```solidity
bytes32 CAK_ROLE
```

Roles
They are managed through AccessControl smart contract
The roles are declared below

### BND_ROLE

```solidity
bytes32 BND_ROLE
```

### CST_ROLE

```solidity
bytes32 CST_ROLE
```

### PAY_ROLE

```solidity
bytes32 PAY_ROLE
```

### constructor

```solidity
constructor() public
```

### isBnD

```solidity
function isBnD(address account) public view returns (bool)
```

### isPay

```solidity
function isPay(address account) public view returns (bool)
```

### isCustodian

```solidity
function isCustodian(address account) public view returns (bool)
```

### isCAK

```solidity
function isCAK(address account) public view returns (bool)
```

### changeAdminRole

```solidity
function changeAdminRole(address account_) public
```

_The aim of this function is to enable the change of the DEFAULT_ADMIN_ROLE, when 2 CAK request it
When a CAK has already voted for an address, another CAK can erase the choice by voting for another address_

### grantRole

```solidity
function grantRole(bytes32 role, address account) public virtual
```

_This function is the override of the public function in AccessControl
That must be rewritted to cover the special case of the CAK role_

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) public virtual
```

_This function is the override of the public function in AccessControl
That must be rewritted to cover the special case of the CAK role_

### grantCakRole

```solidity
function grantCakRole(address cakAddress_) public
```

_The aim of this function is to enable an ADMIN or a CAK to grant CAK role to an address_

### revokeCakRole

```solidity
function revokeCakRole(address cakAddress_) public
```

_The aim of this function is to enable the ADMIN to revoke CAK role of an address_

### grantBndRole

```solidity
function grantBndRole(address bndAddress_) public
```

_The aim of this function is to enable a CAK to grant B&D role to an address_

### revokeBndRole

```solidity
function revokeBndRole(address bndAddress_) public
```

_The aim of this function is to enable a CAK to revoke B&D role of an address_

### grantCstRole

```solidity
function grantCstRole(address cstAddress_) public
```

_The aim of this function is to enable a CAK to grant CUSTODIAN role to an address_

### revokeCstRole

```solidity
function revokeCstRole(address cstAddress_) public
```

_The aim of this function is to enable a CAK to revoke CUSTODIAN role of an address_

### grantPayRole

```solidity
function grantPayRole(address payAddress_) public
```

_The aim of this function is to enable a CAK to grant PAYING AGENT role to an address_

### revokePayRole

```solidity
function revokePayRole(address payAddress_) public
```

_The aim of this function is to enable a CAK to revoke PAYING AGENT role of an address_

## SmartContractAccessManagement

### _contractsAllowed

```solidity
mapping(bytes32 => bool) _contractsAllowed
```

### canManageSmartContracts

```solidity
function canManageSmartContracts() internal view virtual returns (bool)
```

### isCallerApprovedSmartContract

```solidity
function isCallerApprovedSmartContract() external view returns (bool)
```

### isContractAllowed

```solidity
function isContractAllowed(address contractAddress_) public view returns (bool)
```

_The aim of this function is to check if a smart contract is whitelisted through the hash of its bytecode_

### enableContractToWhitelist

```solidity
function enableContractToWhitelist(bytes32 contractHash_) public
```

_The aim of this function is to enable smart contract to be whitelisted through the hash of its bytecode_

### disableContractFromWhitelist

```solidity
function disableContractFromWhitelist(bytes32 contractHash_) public
```

_The aim of this function is to disable smart contract to be whitelisted through the hash of its bytecode_

### atReturningHash

```solidity
function atReturningHash(address addr_) public view returns (bytes32 hash)
```

_This function returns the bytecode'shash of the deployed smart contract address
source : https://gist.github.com/andreafspeziale/557fa432e9929ccf049459972e322bdf_

## IBilateralTrade

### setDetails

```solidity
function setDetails(struct ITrade.TradeDetail _details) external
```

### approve

```solidity
function approve() external returns (enum ITrade.Status)
```

### reject

```solidity
function reject() external
```

### executeTransfer

```solidity
function executeTransfer() external returns (bool)
```

## ICoupon

### computesCouponAmount

```solidity
function computesCouponAmount() external
```

### setDateAsCurrentCoupon

```solidity
function setDateAsCurrentCoupon() external
```

### setNbDays

```solidity
function setNbDays(uint256 _nbDays) external
```

## IPrimaryIssuance

### account

```solidity
function account() external view returns (address)
```

### validate

```solidity
function validate() external
```

as a B&D execute the transfer from the security issuance account to the B&D account. If successfull it will pass the status from Initiated to Completed

### PrimaryIssuanceCreated

```solidity
event PrimaryIssuanceCreated(address contractAddress)
```

## IRegisterRoleManagement

### isBnD

```solidity
function isBnD(address account) external view returns (bool)
```

### isPay

```solidity
function isPay(address account) external view returns (bool)
```

### isCustodian

```solidity
function isCustodian(address account) external view returns (bool)
```

### isCAK

```solidity
function isCAK(address account) external view returns (bool)
```

### changeAdminRole

```solidity
function changeAdminRole(address account) external
```

### grantCakRole

```solidity
function grantCakRole(address cakAddress) external
```

### revokeCakRole

```solidity
function revokeCakRole(address cakAddress) external
```

### grantBndRole

```solidity
function grantBndRole(address bndAddress) external
```

### revokeBndRole

```solidity
function revokeBndRole(address bndAddress) external
```

### grantCstRole

```solidity
function grantCstRole(address cstAddress) external
```

### revokeCstRole

```solidity
function revokeCstRole(address cstAddress) external
```

### grantPayRole

```solidity
function grantPayRole(address cstAddress) external
```

### revokePayRole

```solidity
function revokePayRole(address cstAddress) external
```

### AdminChanged

```solidity
event AdminChanged(address _addressForNewAdmin)
```

## ICouponSnapshotManagement

### _snapshot

```solidity
function _snapshot() external returns (uint256)
```

### Snapshot

```solidity
event Snapshot(uint256 id)
```

_Emitted by {_snapshot} when a snapshot identified by `id` is created._

### balanceOfAt

```solidity
function balanceOfAt(address account, uint256 snapshotId) external view returns (uint256)
```

### balanceOfCoupon

```solidity
function balanceOfCoupon(address account, uint256 _couponDate) external view returns (uint256)
```

### totalSupplyAt

```solidity
function totalSupplyAt(uint256 snapshotId) external view returns (uint256)
```

### totalSupplyAtCoupon

```solidity
function totalSupplyAtCoupon(uint256 _couponDate) external view returns (uint256)
```

### currentSnapshotDatetime

```solidity
function currentSnapshotDatetime() external view returns (uint256)
```

### currentCouponDate

```solidity
function currentCouponDate() external view returns (uint256)
```

## ISmartContractAccessManagement

### enableContractToWhitelist

```solidity
function enableContractToWhitelist(bytes32 contractHash) external
```

### disableContractFromWhitelist

```solidity
function disableContractFromWhitelist(bytes32 contractHash) external
```

### isCallerApprovedSmartContract

```solidity
function isCallerApprovedSmartContract() external view returns (bool)
```

### EnableContract

```solidity
event EnableContract(bytes32 contractHash)
```

### DisableContract

```solidity
event DisableContract(bytes32 contractHash)
```

## IRegister

### Status

```solidity
enum Status {
  Draft,
  Ready,
  Issued,
  Repaid,
  Frozen
}
```

### primaryIssuanceAccount

```solidity
function primaryIssuanceAccount() external view returns (address)
```

### returnBalanceToPrimaryIssuanceAccount

```solidity
function returnBalanceToPrimaryIssuanceAccount(address investor) external returns (bool)
```

### getAllInvestors

```solidity
function getAllInvestors() external view returns (address[])
```

### disableInvestorFromWhitelist

```solidity
function disableInvestorFromWhitelist(address investor) external
```

### enableInvestorToWhitelist

```solidity
function enableInvestorToWhitelist(address investor) external
```

### investorsAllowed

```solidity
function investorsAllowed(address investor) external view returns (bool)
```

### investorCustodian

```solidity
function investorCustodian(address investor) external view returns (address)
```

### checkIfCouponDateExists

```solidity
function checkIfCouponDateExists(uint256 _couponDate) external returns (bool)
```

### checkIfMaturityDateExists

```solidity
function checkIfMaturityDateExists(uint256 _maturityDate) external returns (bool)
```

### makeReady

```solidity
function makeReady() external
```

### revertReady

```solidity
function revertReady() external
```

### publicMessage

```solidity
function publicMessage(address to, string message) external
```

### status

```solidity
function status() external view returns (enum IRegister.Status)
```

### setCurrentCouponDate

```solidity
function setCurrentCouponDate(uint256 couponDate_, uint256 recordDatetime_) external
```

### getInvestorListAtCoupon

```solidity
function getInvestorListAtCoupon(uint256 CouponDate) external returns (address[])
```

### toggleFrozen

```solidity
function toggleFrozen() external
```

### WalletAddedToWhitelist

```solidity
event WalletAddedToWhitelist(address toBeAdded)
```

### WalletDeletedFromWhitelist

```solidity
event WalletDeletedFromWhitelist(address toBeDeleted)
```

### EnableInvestor

```solidity
event EnableInvestor(address investor)
```

### DisableInvestor

```solidity
event DisableInvestor(address investor)
```

### NewBondDrafted

```solidity
event NewBondDrafted(address creator, string name, string isin)
```

### RegisterStatusChanged

```solidity
event RegisterStatusChanged(address emiter, string name, string isin, enum IRegister.Status status)
```

### PublicMessage

```solidity
event PublicMessage(address sender, address target, string message)
```

### InvestorInfo

```solidity
struct InvestorInfo {
  address investor;
  bool allowed;
  uint256 index;
  address custodian;
}
```

## IRegisterMetadata

### BondData

```solidity
struct BondData {
  string name;
  string isin;
  uint256 expectedSupply;
  bytes32 currency;
  uint256 unitValue;
  uint256 couponRate;
  uint256 creationDate;
  uint256 issuanceDate;
  uint256 maturityDate;
  uint256[] couponDates;
  uint256 cutOffTime;
}
```

### setIsinSymbol

```solidity
function setIsinSymbol(string isinSymbol) external
```

### setCurrency

```solidity
function setCurrency(bytes32 currency) external
```

### getCreationDate

```solidity
function getCreationDate() external view returns (uint256)
```

### getIssuanceDate

```solidity
function getIssuanceDate() external view returns (uint256)
```

### setCreationDate

```solidity
function setCreationDate(uint256 creationDate) external
```

### setIssuanceDate

```solidity
function setIssuanceDate(uint256 issuanceDate) external
```

### setBondData

```solidity
function setBondData(string name_, uint256 expectedSupply_, bytes32 currency_, uint256 unitVal_, uint256 couponRate_, uint256 issuanceDate_, uint256 maturityDate_, uint256 cutOffTime_) external
```

### addCouponDate

```solidity
function addCouponDate(uint256 date) external
```

### delCouponDate

```solidity
function delCouponDate(uint256 date) external
```

### setExpectedSupply

```solidity
function setExpectedSupply(uint256 expectedSupply) external
```

### getBondData

```solidity
function getBondData() external view returns (struct IRegisterMetadata.BondData)
```

### getBondCouponRate

```solidity
function getBondCouponRate() external view returns (uint256)
```

### getBondUnitValue

```solidity
function getBondUnitValue() external view returns (uint256)
```

## ITrade

### Status

```solidity
enum Status {
  Draft,
  Pending,
  Rejected,
  Accepted,
  Executed,
  Paid
}
```

### TradeDetail

```solidity
struct TradeDetail {
  uint256 quantity;
  address buyer;
  uint256 tradeDate;
  uint256 valueDate;
  uint256 price;
}
```

### register

```solidity
function register() external view returns (contract IRegister)
```

### status

```solidity
function status() external view returns (enum ITrade.Status)
```

### paymentID

```solidity
function paymentID() external view returns (bytes8)
```

### getDetails

```solidity
function getDetails() external view returns (struct ITrade.TradeDetail)
```

### sellerAccount

```solidity
function sellerAccount() external view returns (address)
```

### buyerAccount

```solidity
function buyerAccount() external view returns (address)
```

### NotifyTrade

```solidity
event NotifyTrade(address seller, address buyer, enum ITrade.Status status, uint256 quantity)
```

