# Solidity API

## IERC173

### OwnershipTransferred

```solidity
event OwnershipTransferred(address previousOwner, address newOwner)
```

_This emits when ownership of a contract changes._

### owner

```solidity
function owner() external view returns (address)
```

Get the address of the owner

#### Return Values

| Name | Type    | Description               |
| ---- | ------- | ------------------------- |
| [0]  | address | The address of the owner. |

### transferOwnership

```solidity
function transferOwnership(address account) external
```

Set the address of the new owner of the contract

#### Parameters

| Name    | Type    | Description                                  |
| ------- | ------- | -------------------------------------------- |
| account | address | The address of the new owner of the contract |

## IOwnable

### renounceOwnership

```solidity
function renounceOwnership() external
```

Leaves the contract without owner. It will not be possible to call

NOTE: Renouncing ownership will leave the contract without an owner,
thereby disabling any functionality that is only available to the owner.

## Ownable

### owner

```solidity
function owner() public view virtual returns (address)
```

Get the address of the owner

#### Return Values

| Name | Type    | Description               |
| ---- | ------- | ------------------------- |
| [0]  | address | The address of the owner. |

### transferOwnership

```solidity
function transferOwnership(address account) public virtual
```

Set the address of the new owner of the contract

#### Parameters

| Name    | Type    | Description                                  |
| ------- | ------- | -------------------------------------------- |
| account | address | The address of the new owner of the contract |

### renounceOwnership

```solidity
function renounceOwnership() public virtual
```

Leaves the contract without owner. It will not be possible to call

NOTE: Renouncing ownership will leave the contract without an owner,
thereby disabling any functionality that is only available to the owner.

## OwnableInternal

### onlyOwner

```solidity
modifier onlyOwner()
```

### \_owner

```solidity
function _owner() internal view virtual returns (address)
```

### \_transferOwnership

```solidity
function _transferOwnership(address account) internal virtual
```

### \_setOwner

```solidity
function _setOwner(address account) internal virtual
```

## OwnableStorage

### Layout

```solidity
struct Layout {
  address owner;
}
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

### layout

```solidity
function layout() internal pure returns (struct OwnableStorage.Layout l)
```

## AccessControl

_derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)_

### grantRole

```solidity
function grantRole(bytes32 role, address account) external
```

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external
```

### renounceRole

```solidity
function renounceRole(bytes32 role) external
```

relinquish role

#### Parameters

| Name | Type    | Description        |
| ---- | ------- | ------------------ |
| role | bytes32 | role to relinquish |

### getRoleMember

```solidity
function getRoleMember(bytes32 role, uint256 index) external view returns (address)
```

Returns one of the accounts that have `role`. `index` must be a
value between 0 and {getRoleMemberCount}, non-inclusive.

Role bearers are not sorted in any particular way, and their ordering may
change at any point.

WARNING: When using {getRoleMember} and {getRoleMemberCount}, make sure
you perform all queries on the same block. See the following
https://forum.openzeppelin.com/t/iterating-over-elements-on-enumerableset-in-openzeppelin-contracts/2296[forum post]
for more information.

### getRoleMemberCount

```solidity
function getRoleMemberCount(bytes32 role) external view returns (uint256)
```

Returns the number of accounts that have `role`. Can be used
together with {getRoleMember} to enumerate all bearers of a role.

## AccessControlInternal

_derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)_

### onlyRole

```solidity
modifier onlyRole(bytes32 role)
```

### \_hasRole

```solidity
function _hasRole(bytes32 role, address account) internal view virtual returns (bool)
```

### \_checkRole

```solidity
function _checkRole(bytes32 role) internal view virtual
```

revert if sender does not have given role

#### Parameters

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| role | bytes32 | role to query |

### \_checkRole

```solidity
function _checkRole(bytes32 role, address account) internal view virtual
```

revert if given account does not have given role

#### Parameters

| Name    | Type    | Description   |
| ------- | ------- | ------------- |
| role    | bytes32 | role to query |
| account | address | to query      |

### \_getRoleAdmin

```solidity
function _getRoleAdmin(bytes32 role) internal view virtual returns (bytes32)
```

### \_setRoleAdmin

```solidity
function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual
```

set role as admin role

#### Parameters

| Name      | Type    | Description       |
| --------- | ------- | ----------------- |
| role      | bytes32 | role to set       |
| adminRole | bytes32 | admin role to set |

### \_grantRole

```solidity
function _grantRole(bytes32 role, address account) internal virtual
```

### \_revokeRole

```solidity
function _revokeRole(bytes32 role, address account) internal virtual
```

### \_renounceRole

```solidity
function _renounceRole(bytes32 role) internal virtual
```

Renounce role

#### Parameters

| Name | Type    | Description      |
| ---- | ------- | ---------------- |
| role | bytes32 | role to renounce |

### \_getRoleMember

```solidity
function _getRoleMember(bytes32 role, uint256 index) internal view virtual returns (address)
```

query role for member at given index

#### Parameters

| Name  | Type    | Description    |
| ----- | ------- | -------------- |
| role  | bytes32 | role to query  |
| index | uint256 | index to query |

### \_getRoleMemberCount

```solidity
function _getRoleMemberCount(bytes32 role) internal view virtual returns (uint256)
```

query role for member count

#### Parameters

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| role | bytes32 | role to query |

## AccessControlStorage

### RoleData

```solidity
struct RoleData {
  struct EnumerableSet.AddressSet roleMembers;
  bytes32 adminRole;
}
```

### Layout

```solidity
struct Layout {
  mapping(bytes32 => struct AccessControlStorage.RoleData) roles;
}
```

### DEFAULT_ADMIN_ROLE

```solidity
bytes32 DEFAULT_ADMIN_ROLE
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

### layout

```solidity
function layout() internal pure returns (struct AccessControlStorage.Layout l)
```

## IAccessControl

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 role, bytes32 previousAdminRole, bytes32 newAdminRole)
```

\_Emitted when `newAdminRole` is set as `role`'s admin role, replacing `previousAdminRole`

`DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
{RoleAdminChanged} not being emitted signaling this.

\_Available since v3.1.\_\_

### RoleGranted

```solidity
event RoleGranted(bytes32 role, address account, address sender)
```

\_Emitted when `account` is granted `role`.

`sender` is the account that originated the contract call, an admin role
bearer except when using {AccessControl-_setupRole}._

### RoleRevoked

```solidity
event RoleRevoked(bytes32 role, address account, address sender)
```

\_Emitted when `account` is revoked `role`.

`sender` is the account that originated the contract call:

- if using `revokeRole`, it is the admin role bearer
- if using `renounceRole`, it is the role bearer (i.e. `account`)\_

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```

### grantRole

```solidity
function grantRole(bytes32 role, address account) external
```

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external
```

### renounceRole

```solidity
function renounceRole(bytes32 role) external
```

relinquish role

#### Parameters

| Name | Type    | Description        |
| ---- | ------- | ------------------ |
| role | bytes32 | role to relinquish |

### getRoleMember

```solidity
function getRoleMember(bytes32 role, uint256 index) external view returns (address)
```

Returns one of the accounts that have `role`. `index` must be a
value between 0 and {getRoleMemberCount}, non-inclusive.

Role bearers are not sorted in any particular way, and their ordering may
change at any point.

WARNING: When using {getRoleMember} and {getRoleMemberCount}, make sure
you perform all queries on the same block. See the following
https://forum.openzeppelin.com/t/iterating-over-elements-on-enumerableset-in-openzeppelin-contracts/2296[forum post]
for more information.

### getRoleMemberCount

```solidity
function getRoleMemberCount(bytes32 role) external view returns (uint256)
```

Returns the number of accounts that have `role`. Can be used
together with {getRoleMember} to enumerate all bearers of a role.

## ECDSA

_derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)_

### ECDSA\_\_InvalidS

```solidity
error ECDSA__InvalidS()
```

### ECDSA\_\_InvalidSignature

```solidity
error ECDSA__InvalidSignature()
```

### ECDSA\_\_InvalidSignatureLength

```solidity
error ECDSA__InvalidSignatureLength()
```

### ECDSA\_\_InvalidV

```solidity
error ECDSA__InvalidV()
```

### recover

```solidity
function recover(bytes32 hash, bytes signature) internal pure returns (address)
```

recover signer of hashed message from signature

#### Parameters

| Name      | Type    | Description         |
| --------- | ------- | ------------------- |
| hash      | bytes32 | hashed data payload |
| signature | bytes   | signed data payload |

#### Return Values

| Name | Type    | Description              |
| ---- | ------- | ------------------------ |
| [0]  | address | recovered message signer |

### recover

```solidity
function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address)
```

recover signer of hashed message from signature v, r, and s values

#### Parameters

| Name | Type    | Description         |
| ---- | ------- | ------------------- |
| hash | bytes32 | hashed data payload |
| v    | uint8   | signature "v" value |
| r    | bytes32 | signature "r" value |
| s    | bytes32 | signature "s" value |

#### Return Values

| Name | Type    | Description              |
| ---- | ------- | ------------------------ |
| [0]  | address | recovered message signer |

### toEthSignedMessageHash

```solidity
function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32)
```

generate an "Ethereum Signed Message" in the format returned by the eth_sign JSON-RPC method

#### Parameters

| Name | Type    | Description         |
| ---- | ------- | ------------------- |
| hash | bytes32 | hashed data payload |

#### Return Values

| Name | Type    | Description         |
| ---- | ------- | ------------------- |
| [0]  | bytes32 | signed message hash |

## ECDSAMock

### recover

```solidity
function recover(bytes32 hash, bytes signature) external pure returns (address)
```

### recover

```solidity
function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) external pure returns (address)
```

### toEthSignedMessageHash

```solidity
function toEthSignedMessageHash(bytes32 hash) external pure returns (bytes32)
```

## EIP712

_see https://eips.ethereum.org/EIPS/eip-712_

### EIP712_TYPE_HASH

```solidity
bytes32 EIP712_TYPE_HASH
```

### calculateDomainSeparator

```solidity
function calculateDomainSeparator(bytes32 nameHash, bytes32 versionHash) internal view returns (bytes32 domainSeparator)
```

calculate unique EIP-712 domain separator

_name and version inputs are hashed as required by EIP-712 because they are of dynamic-length types
implementation of EIP712Domain struct type excludes the optional salt parameter_

#### Parameters

| Name        | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| nameHash    | bytes32 | hash of human-readable signing domain name |
| versionHash | bytes32 | hash of signing domain version             |

#### Return Values

| Name            | Type    | Description      |
| --------------- | ------- | ---------------- |
| domainSeparator | bytes32 | domain separator |

## EIP712Mock

### calculateDomainSeparator

```solidity
function calculateDomainSeparator(bytes32 nameHash, bytes32 versionHash) external view returns (bytes32)
```

## MerkleProof

_derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)_

### verify

```solidity
function verify(bytes32[] proof, bytes32 root, bytes32 leaf) internal pure returns (bool)
```

verify whether given leaf is contained within Merkle tree defined by given root

#### Parameters

| Name  | Type      | Description                                    |
| ----- | --------- | ---------------------------------------------- |
| proof | bytes32[] | proof that Merkle tree contains given leaf     |
| root  | bytes32   | Merkle tree root                               |
| leaf  | bytes32   | element whose presence in Merkle tree to prove |

#### Return Values

| Name | Type | Description                                                               |
| ---- | ---- | ------------------------------------------------------------------------- |
| [0]  | bool | whether leaf is proven to be contained within Merkle tree defined by root |

## MerkleProofMock

### verify

```solidity
function verify(bytes32[] proof, bytes32 root, bytes32 leaf) external pure returns (bool)
```

## BinaryHeap

_The data structure is configured as a max-heap_

### Heap

```solidity
struct Heap {
  bytes32[] _values;
  mapping(bytes32 => uint256) _indexes;
}
```

### Bytes32Heap

```solidity
struct Bytes32Heap {
  struct BinaryHeap.Heap _inner;
}
```

### AddressHeap

```solidity
struct AddressHeap {
  struct BinaryHeap.Heap _inner;
}
```

### UintHeap

```solidity
struct UintHeap {
  struct BinaryHeap.Heap _inner;
}
```

### at

```solidity
function at(struct BinaryHeap.Bytes32Heap heap, uint256 index) internal view returns (bytes32)
```

### at

```solidity
function at(struct BinaryHeap.AddressHeap heap, uint256 index) internal view returns (address)
```

### at

```solidity
function at(struct BinaryHeap.UintHeap heap, uint256 index) internal view returns (uint256)
```

### contains

```solidity
function contains(struct BinaryHeap.Bytes32Heap heap, bytes32 value) internal view returns (bool)
```

### contains

```solidity
function contains(struct BinaryHeap.AddressHeap heap, address value) internal view returns (bool)
```

### contains

```solidity
function contains(struct BinaryHeap.UintHeap heap, uint256 value) internal view returns (bool)
```

### indexOf

```solidity
function indexOf(struct BinaryHeap.Bytes32Heap heap, bytes32 value) internal view returns (uint256)
```

### indexOf

```solidity
function indexOf(struct BinaryHeap.AddressHeap heap, address value) internal view returns (uint256)
```

### indexOf

```solidity
function indexOf(struct BinaryHeap.UintHeap heap, uint256 value) internal view returns (uint256)
```

### length

```solidity
function length(struct BinaryHeap.Bytes32Heap heap) internal view returns (uint256)
```

### length

```solidity
function length(struct BinaryHeap.AddressHeap heap) internal view returns (uint256)
```

### length

```solidity
function length(struct BinaryHeap.UintHeap heap) internal view returns (uint256)
```

### root

```solidity
function root(struct BinaryHeap.Bytes32Heap heap) internal view returns (bytes32)
```

### root

```solidity
function root(struct BinaryHeap.AddressHeap heap) internal view returns (address)
```

### root

```solidity
function root(struct BinaryHeap.UintHeap heap) internal view returns (uint256)
```

### add

```solidity
function add(struct BinaryHeap.Bytes32Heap heap, bytes32 value) internal returns (bool)
```

### add

```solidity
function add(struct BinaryHeap.AddressHeap heap, address value) internal returns (bool)
```

### add

```solidity
function add(struct BinaryHeap.UintHeap heap, uint256 value) internal returns (bool)
```

### remove

```solidity
function remove(struct BinaryHeap.Bytes32Heap heap, bytes32 value) internal returns (bool)
```

### remove

```solidity
function remove(struct BinaryHeap.AddressHeap heap, address value) internal returns (bool)
```

### remove

```solidity
function remove(struct BinaryHeap.UintHeap heap, uint256 value) internal returns (bool)
```

### toArray

```solidity
function toArray(struct BinaryHeap.Bytes32Heap heap) internal view returns (bytes32[])
```

### toArray

```solidity
function toArray(struct BinaryHeap.AddressHeap heap) internal view returns (address[])
```

### toArray

```solidity
function toArray(struct BinaryHeap.UintHeap heap) internal view returns (uint256[])
```

## BinaryHeapAddressMock

### addressHeap

```solidity
struct BinaryHeap.AddressHeap addressHeap
```

### at

```solidity
function at(uint256 index) external view returns (address)
```

### contains

```solidity
function contains(address value) external view returns (bool)
```

### indexOf

```solidity
function indexOf(address value) external view returns (uint256)
```

### length

```solidity
function length() external view returns (uint256)
```

### root

```solidity
function root() external view returns (address)
```

### add

```solidity
function add(address value) external returns (bool)
```

### remove

```solidity
function remove(address value) external returns (bool)
```

### toArray

```solidity
function toArray() external view returns (address[])
```

## BinaryHeapBytes32Mock

### bytes32Heap

```solidity
struct BinaryHeap.Bytes32Heap bytes32Heap
```

### at

```solidity
function at(uint256 index) external view returns (bytes32)
```

### contains

```solidity
function contains(bytes32 value) external view returns (bool)
```

### indexOf

```solidity
function indexOf(bytes32 value) external view returns (uint256)
```

### length

```solidity
function length() external view returns (uint256)
```

### root

```solidity
function root() external view returns (bytes32)
```

### add

```solidity
function add(bytes32 value) external returns (bool)
```

### remove

```solidity
function remove(bytes32 value) external returns (bool)
```

### toArray

```solidity
function toArray() external view returns (bytes32[])
```

## BinaryHeapUintMock

### uintHeap

```solidity
struct BinaryHeap.UintHeap uintHeap
```

### at

```solidity
function at(uint256 index) external view returns (uint256)
```

### contains

```solidity
function contains(uint256 value) external view returns (bool)
```

### indexOf

```solidity
function indexOf(uint256 value) external view returns (uint256)
```

### length

```solidity
function length() external view returns (uint256)
```

### root

```solidity
function root() external view returns (uint256)
```

### add

```solidity
function add(uint256 value) external returns (bool)
```

### remove

```solidity
function remove(uint256 value) external returns (bool)
```

### toArray

```solidity
function toArray() external view returns (uint256[])
```

## DoublyLinkedList

### DoublyLinkedListInternal

```solidity
struct DoublyLinkedListInternal {
  mapping(bytes32 => bytes32) _nextValues;
  mapping(bytes32 => bytes32) _prevValues;
}
```

### Bytes32List

```solidity
struct Bytes32List {
  struct DoublyLinkedList.DoublyLinkedListInternal _inner;
}
```

### AddressList

```solidity
struct AddressList {
  struct DoublyLinkedList.DoublyLinkedListInternal _inner;
}
```

### Uint256List

```solidity
struct Uint256List {
  struct DoublyLinkedList.DoublyLinkedListInternal _inner;
}
```

### DoublyLinkedList\_\_InvalidInput

```solidity
error DoublyLinkedList__InvalidInput()
```

indicate that an attempt was made to insert 0 into a list

### DoublyLinkedList\_\_NonExistentEntry

```solidity
error DoublyLinkedList__NonExistentEntry()
```

indicate that a non-existent value was used as a reference for insertion or lookup

### contains

```solidity
function contains(struct DoublyLinkedList.Bytes32List self, bytes32 value) internal view returns (bool)
```

### contains

```solidity
function contains(struct DoublyLinkedList.AddressList self, address value) internal view returns (bool)
```

### contains

```solidity
function contains(struct DoublyLinkedList.Uint256List self, uint256 value) internal view returns (bool)
```

### prev

```solidity
function prev(struct DoublyLinkedList.Bytes32List self, bytes32 value) internal view returns (bytes32)
```

### prev

```solidity
function prev(struct DoublyLinkedList.AddressList self, address value) internal view returns (address)
```

### prev

```solidity
function prev(struct DoublyLinkedList.Uint256List self, uint256 value) internal view returns (uint256)
```

### next

```solidity
function next(struct DoublyLinkedList.Bytes32List self, bytes32 value) internal view returns (bytes32)
```

### next

```solidity
function next(struct DoublyLinkedList.AddressList self, address value) internal view returns (address)
```

### next

```solidity
function next(struct DoublyLinkedList.Uint256List self, uint256 value) internal view returns (uint256)
```

### insertBefore

```solidity
function insertBefore(struct DoublyLinkedList.Bytes32List self, bytes32 nextValue, bytes32 newValue) internal returns (bool status)
```

### insertBefore

```solidity
function insertBefore(struct DoublyLinkedList.AddressList self, address nextValue, address newValue) internal returns (bool status)
```

### insertBefore

```solidity
function insertBefore(struct DoublyLinkedList.Uint256List self, uint256 nextValue, uint256 newValue) internal returns (bool status)
```

### insertAfter

```solidity
function insertAfter(struct DoublyLinkedList.Bytes32List self, bytes32 prevValue, bytes32 newValue) internal returns (bool status)
```

### insertAfter

```solidity
function insertAfter(struct DoublyLinkedList.AddressList self, address prevValue, address newValue) internal returns (bool status)
```

### insertAfter

```solidity
function insertAfter(struct DoublyLinkedList.Uint256List self, uint256 prevValue, uint256 newValue) internal returns (bool status)
```

### push

```solidity
function push(struct DoublyLinkedList.Bytes32List self, bytes32 value) internal returns (bool status)
```

### push

```solidity
function push(struct DoublyLinkedList.AddressList self, address value) internal returns (bool status)
```

### push

```solidity
function push(struct DoublyLinkedList.Uint256List self, uint256 value) internal returns (bool status)
```

### pop

```solidity
function pop(struct DoublyLinkedList.Bytes32List self) internal returns (bytes32 value)
```

### pop

```solidity
function pop(struct DoublyLinkedList.AddressList self) internal returns (address value)
```

### pop

```solidity
function pop(struct DoublyLinkedList.Uint256List self) internal returns (uint256 value)
```

### shift

```solidity
function shift(struct DoublyLinkedList.Bytes32List self) internal returns (bytes32 value)
```

### shift

```solidity
function shift(struct DoublyLinkedList.AddressList self) internal returns (address value)
```

### shift

```solidity
function shift(struct DoublyLinkedList.Uint256List self) internal returns (uint256 value)
```

### unshift

```solidity
function unshift(struct DoublyLinkedList.Bytes32List self, bytes32 value) internal returns (bool status)
```

### unshift

```solidity
function unshift(struct DoublyLinkedList.AddressList self, address value) internal returns (bool status)
```

### unshift

```solidity
function unshift(struct DoublyLinkedList.Uint256List self, uint256 value) internal returns (bool status)
```

### remove

```solidity
function remove(struct DoublyLinkedList.Bytes32List self, bytes32 value) internal returns (bool status)
```

### remove

```solidity
function remove(struct DoublyLinkedList.AddressList self, address value) internal returns (bool status)
```

### remove

```solidity
function remove(struct DoublyLinkedList.Uint256List self, uint256 value) internal returns (bool status)
```

### replace

```solidity
function replace(struct DoublyLinkedList.Bytes32List self, bytes32 oldValue, bytes32 newValue) internal returns (bool status)
```

### replace

```solidity
function replace(struct DoublyLinkedList.AddressList self, address oldValue, address newValue) internal returns (bool status)
```

### replace

```solidity
function replace(struct DoublyLinkedList.Uint256List self, uint256 oldValue, uint256 newValue) internal returns (bool status)
```

## DoublyLinkedListAddressMock

### contains

```solidity
function contains(address value) external view returns (bool)
```

### prev

```solidity
function prev(address value) external view returns (address)
```

### next

```solidity
function next(address value) external view returns (address)
```

### insertBefore

```solidity
function insertBefore(address nextValue, address newValue) external returns (bool)
```

### insertAfter

```solidity
function insertAfter(address prevValue, address newValue) external returns (bool)
```

### push

```solidity
function push(address value) external returns (bool)
```

### pop

```solidity
function pop() external returns (address)
```

### shift

```solidity
function shift() external returns (address)
```

### unshift

```solidity
function unshift(address value) external returns (bool)
```

### remove

```solidity
function remove(address value) external returns (bool)
```

### replace

```solidity
function replace(address oldValue, address newValue) external returns (bool)
```

## DoublyLinkedListBytes32Mock

### contains

```solidity
function contains(bytes32 value) external view returns (bool)
```

### prev

```solidity
function prev(bytes32 value) external view returns (bytes32)
```

### next

```solidity
function next(bytes32 value) external view returns (bytes32)
```

### insertBefore

```solidity
function insertBefore(bytes32 nextValue, bytes32 newValue) external returns (bool)
```

### insertAfter

```solidity
function insertAfter(bytes32 prevValue, bytes32 newValue) external returns (bool)
```

### push

```solidity
function push(bytes32 value) external returns (bool)
```

### pop

```solidity
function pop() external returns (bytes32)
```

### shift

```solidity
function shift() external returns (bytes32)
```

### unshift

```solidity
function unshift(bytes32 value) external returns (bool)
```

### remove

```solidity
function remove(bytes32 value) external returns (bool)
```

### replace

```solidity
function replace(bytes32 oldValue, bytes32 newValue) external returns (bool)
```

## DoublyLinkedListUint256Mock

### contains

```solidity
function contains(uint256 value) external view returns (bool)
```

### prev

```solidity
function prev(uint256 value) external view returns (uint256)
```

### next

```solidity
function next(uint256 value) external view returns (uint256)
```

### insertBefore

```solidity
function insertBefore(uint256 nextValue, uint256 newValue) external returns (bool)
```

### insertAfter

```solidity
function insertAfter(uint256 prevValue, uint256 newValue) external returns (bool)
```

### push

```solidity
function push(uint256 value) external returns (bool)
```

### pop

```solidity
function pop() external returns (uint256)
```

### shift

```solidity
function shift() external returns (uint256)
```

### unshift

```solidity
function unshift(uint256 value) external returns (bool)
```

### remove

```solidity
function remove(uint256 value) external returns (bool)
```

### replace

```solidity
function replace(uint256 oldValue, uint256 newValue) external returns (bool)
```

## EnumerableMap

_derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)_

### EnumerableMap\_\_IndexOutOfBounds

```solidity
error EnumerableMap__IndexOutOfBounds()
```

### EnumerableMap\_\_NonExistentKey

```solidity
error EnumerableMap__NonExistentKey()
```

### MapEntry

```solidity
struct MapEntry {
  bytes32 _key;
  bytes32 _value;
}
```

### Map

```solidity
struct Map {
  struct EnumerableMap.MapEntry[] _entries;
  mapping(bytes32 => uint256) _indexes;
}
```

### AddressToAddressMap

```solidity
struct AddressToAddressMap {
  struct EnumerableMap.Map _inner;
}
```

### UintToAddressMap

```solidity
struct UintToAddressMap {
  struct EnumerableMap.Map _inner;
}
```

### at

```solidity
function at(struct EnumerableMap.AddressToAddressMap map, uint256 index) internal view returns (address, address)
```

### at

```solidity
function at(struct EnumerableMap.UintToAddressMap map, uint256 index) internal view returns (uint256, address)
```

### contains

```solidity
function contains(struct EnumerableMap.AddressToAddressMap map, address key) internal view returns (bool)
```

### contains

```solidity
function contains(struct EnumerableMap.UintToAddressMap map, uint256 key) internal view returns (bool)
```

### length

```solidity
function length(struct EnumerableMap.AddressToAddressMap map) internal view returns (uint256)
```

### length

```solidity
function length(struct EnumerableMap.UintToAddressMap map) internal view returns (uint256)
```

### get

```solidity
function get(struct EnumerableMap.AddressToAddressMap map, address key) internal view returns (address)
```

### get

```solidity
function get(struct EnumerableMap.UintToAddressMap map, uint256 key) internal view returns (address)
```

### set

```solidity
function set(struct EnumerableMap.AddressToAddressMap map, address key, address value) internal returns (bool)
```

### set

```solidity
function set(struct EnumerableMap.UintToAddressMap map, uint256 key, address value) internal returns (bool)
```

### remove

```solidity
function remove(struct EnumerableMap.AddressToAddressMap map, address key) internal returns (bool)
```

### remove

```solidity
function remove(struct EnumerableMap.UintToAddressMap map, uint256 key) internal returns (bool)
```

### toArray

```solidity
function toArray(struct EnumerableMap.AddressToAddressMap map) internal view returns (address[] keysOut, address[] valuesOut)
```

### toArray

```solidity
function toArray(struct EnumerableMap.UintToAddressMap map) internal view returns (uint256[] keysOut, address[] valuesOut)
```

### keys

```solidity
function keys(struct EnumerableMap.AddressToAddressMap map) internal view returns (address[] keysOut)
```

### keys

```solidity
function keys(struct EnumerableMap.UintToAddressMap map) internal view returns (uint256[] keysOut)
```

### values

```solidity
function values(struct EnumerableMap.AddressToAddressMap map) internal view returns (address[] valuesOut)
```

### values

```solidity
function values(struct EnumerableMap.UintToAddressMap map) internal view returns (address[] valuesOut)
```

## EnumerableMapAddressToAddressMock

### map

```solidity
struct EnumerableMap.AddressToAddressMap map
```

### at

```solidity
function at(uint256 index) external view returns (address, address)
```

### contains

```solidity
function contains(address key) external view returns (bool)
```

### length

```solidity
function length() external view returns (uint256)
```

### get

```solidity
function get(address key) external view returns (address)
```

### set

```solidity
function set(address key, address value) external returns (bool)
```

### remove

```solidity
function remove(address key) external returns (bool)
```

### toArray

```solidity
function toArray() external view returns (address[] keysOut, address[] valuesOut)
```

### keys

```solidity
function keys() external view returns (address[] keysOut)
```

### values

```solidity
function values() external view returns (address[] valuesOut)
```

## EnumerableMapUintToAddressMock

### map

```solidity
struct EnumerableMap.UintToAddressMap map
```

### at

```solidity
function at(uint256 index) external view returns (uint256, address)
```

### contains

```solidity
function contains(uint256 key) external view returns (bool)
```

### length

```solidity
function length() external view returns (uint256)
```

### get

```solidity
function get(uint256 key) external view returns (address)
```

### set

```solidity
function set(uint256 key, address value) external returns (bool)
```

### remove

```solidity
function remove(uint256 key) external returns (bool)
```

### toArray

```solidity
function toArray() external view returns (uint256[] keysOut, address[] valuesOut)
```

### keys

```solidity
function keys() external view returns (uint256[] keysOut)
```

### values

```solidity
function values() external view returns (address[] valuesOut)
```

## EnumerableSet

_derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)_

### EnumerableSet\_\_IndexOutOfBounds

```solidity
error EnumerableSet__IndexOutOfBounds()
```

### Set

```solidity
struct Set {
  bytes32[] _values;
  mapping(bytes32 => uint256) _indexes;
}
```

### Bytes32Set

```solidity
struct Bytes32Set {
  struct EnumerableSet.Set _inner;
}
```

### AddressSet

```solidity
struct AddressSet {
  struct EnumerableSet.Set _inner;
}
```

### UintSet

```solidity
struct UintSet {
  struct EnumerableSet.Set _inner;
}
```

### at

```solidity
function at(struct EnumerableSet.Bytes32Set set, uint256 index) internal view returns (bytes32)
```

### at

```solidity
function at(struct EnumerableSet.AddressSet set, uint256 index) internal view returns (address)
```

### at

```solidity
function at(struct EnumerableSet.UintSet set, uint256 index) internal view returns (uint256)
```

### contains

```solidity
function contains(struct EnumerableSet.Bytes32Set set, bytes32 value) internal view returns (bool)
```

### contains

```solidity
function contains(struct EnumerableSet.AddressSet set, address value) internal view returns (bool)
```

### contains

```solidity
function contains(struct EnumerableSet.UintSet set, uint256 value) internal view returns (bool)
```

### indexOf

```solidity
function indexOf(struct EnumerableSet.Bytes32Set set, bytes32 value) internal view returns (uint256)
```

### indexOf

```solidity
function indexOf(struct EnumerableSet.AddressSet set, address value) internal view returns (uint256)
```

### indexOf

```solidity
function indexOf(struct EnumerableSet.UintSet set, uint256 value) internal view returns (uint256)
```

### length

```solidity
function length(struct EnumerableSet.Bytes32Set set) internal view returns (uint256)
```

### length

```solidity
function length(struct EnumerableSet.AddressSet set) internal view returns (uint256)
```

### length

```solidity
function length(struct EnumerableSet.UintSet set) internal view returns (uint256)
```

### add

```solidity
function add(struct EnumerableSet.Bytes32Set set, bytes32 value) internal returns (bool)
```

### add

```solidity
function add(struct EnumerableSet.AddressSet set, address value) internal returns (bool)
```

### add

```solidity
function add(struct EnumerableSet.UintSet set, uint256 value) internal returns (bool)
```

### remove

```solidity
function remove(struct EnumerableSet.Bytes32Set set, bytes32 value) internal returns (bool)
```

### remove

```solidity
function remove(struct EnumerableSet.AddressSet set, address value) internal returns (bool)
```

### remove

```solidity
function remove(struct EnumerableSet.UintSet set, uint256 value) internal returns (bool)
```

### toArray

```solidity
function toArray(struct EnumerableSet.Bytes32Set set) internal view returns (bytes32[])
```

### toArray

```solidity
function toArray(struct EnumerableSet.AddressSet set) internal view returns (address[])
```

### toArray

```solidity
function toArray(struct EnumerableSet.UintSet set) internal view returns (uint256[])
```

## EnumerableSetAddressMock

### addressSet

```solidity
struct EnumerableSet.AddressSet addressSet
```

### at

```solidity
function at(uint256 index) external view returns (address)
```

### contains

```solidity
function contains(address value) external view returns (bool)
```

### indexOf

```solidity
function indexOf(address value) external view returns (uint256)
```

### length

```solidity
function length() external view returns (uint256)
```

### add

```solidity
function add(address value) external returns (bool)
```

### remove

```solidity
function remove(address value) external returns (bool)
```

### toArray

```solidity
function toArray() external view returns (address[])
```

## EnumerableSetBytes32Mock

### bytes32Set

```solidity
struct EnumerableSet.Bytes32Set bytes32Set
```

### at

```solidity
function at(uint256 index) external view returns (bytes32)
```

### contains

```solidity
function contains(bytes32 value) external view returns (bool)
```

### indexOf

```solidity
function indexOf(bytes32 value) external view returns (uint256)
```

### length

```solidity
function length() external view returns (uint256)
```

### add

```solidity
function add(bytes32 value) external returns (bool)
```

### remove

```solidity
function remove(bytes32 value) external returns (bool)
```

### toArray

```solidity
function toArray() external view returns (bytes32[])
```

## EnumerableSetUintMock

### uintSet

```solidity
struct EnumerableSet.UintSet uintSet
```

### at

```solidity
function at(uint256 index) external view returns (uint256)
```

### contains

```solidity
function contains(uint256 value) external view returns (bool)
```

### indexOf

```solidity
function indexOf(uint256 value) external view returns (uint256)
```

### length

```solidity
function length() external view returns (uint256)
```

### add

```solidity
function add(uint256 value) external returns (bool)
```

### remove

```solidity
function remove(uint256 value) external returns (bool)
```

### toArray

```solidity
function toArray() external view returns (uint256[])
```

## IncrementalMerkleTree

### Tree

```solidity
struct Tree {
  bytes32[][] nodes;
}
```

### size

```solidity
function size(struct IncrementalMerkleTree.Tree t) internal view returns (uint256 treeSize)
```

query number of elements contained in tree

#### Parameters

| Name | Type                              | Description                   |
| ---- | --------------------------------- | ----------------------------- |
| t    | struct IncrementalMerkleTree.Tree | Tree struct storage reference |

#### Return Values

| Name     | Type    | Description  |
| -------- | ------- | ------------ |
| treeSize | uint256 | size of tree |

### height

```solidity
function height(struct IncrementalMerkleTree.Tree t) internal view returns (uint256)
```

query one-indexed height of tree

_conventional zero-indexed height would require the use of signed integers, so height is one-indexed instead_

#### Parameters

| Name | Type                              | Description                   |
| ---- | --------------------------------- | ----------------------------- |
| t    | struct IncrementalMerkleTree.Tree | Tree struct storage reference |

#### Return Values

| Name | Type    | Description                |
| ---- | ------- | -------------------------- |
| [0]  | uint256 | one-indexed height of tree |

### root

```solidity
function root(struct IncrementalMerkleTree.Tree t) internal view returns (bytes32 hash)
```

query Merkle root

#### Parameters

| Name | Type                              | Description                   |
| ---- | --------------------------------- | ----------------------------- |
| t    | struct IncrementalMerkleTree.Tree | Tree struct storage reference |

#### Return Values

| Name | Type    | Description |
| ---- | ------- | ----------- |
| hash | bytes32 | root hash   |

### at

```solidity
function at(struct IncrementalMerkleTree.Tree t, uint256 index) internal view returns (bytes32 hash)
```

### push

```solidity
function push(struct IncrementalMerkleTree.Tree t, bytes32 hash) internal
```

add new element to tree

#### Parameters

| Name | Type                              | Description                   |
| ---- | --------------------------------- | ----------------------------- |
| t    | struct IncrementalMerkleTree.Tree | Tree struct storage reference |
| hash | bytes32                           | to add                        |

### pop

```solidity
function pop(struct IncrementalMerkleTree.Tree t) internal
```

### set

```solidity
function set(struct IncrementalMerkleTree.Tree t, uint256 index, bytes32 hash) internal
```

update existing element in tree

#### Parameters

| Name  | Type                              | Description                   |
| ----- | --------------------------------- | ----------------------------- |
| t     | struct IncrementalMerkleTree.Tree | Tree struct storage reference |
| index | uint256                           | index to update               |
| hash  | bytes32                           | new hash to add               |

## IncrementalMerkleTreeMock

### size

```solidity
function size() external view returns (uint256)
```

### height

```solidity
function height() external view returns (uint256)
```

### root

```solidity
function root() external view returns (bytes32)
```

### at

```solidity
function at(uint256 index) external view returns (bytes32)
```

### push

```solidity
function push(bytes32 hash) external
```

### pop

```solidity
function pop() external
```

### set

```solidity
function set(uint256 index, bytes32 hash) external
```

## ERC165

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

Query if a contract implements an interface

_Interface identification is specified in ERC-165. This function
uses less than 30,000 gas._

#### Parameters

| Name        | Type   | Description                                       |
| ----------- | ------ | ------------------------------------------------- |
| interfaceId | bytes4 | The interface identifier, as specified in ERC-165 |

#### Return Values

| Name | Type | Description                                                                                            |
| ---- | ---- | ------------------------------------------------------------------------------------------------------ |
| [0]  | bool | `true` if the contract implements `interfaceId` and `interfaceId` is not 0xffffffff, `false` otherwise |

## ERC165Storage

### Layout

```solidity
struct Layout {
  mapping(bytes4 => bool) supportedInterfaces;
}
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

### layout

```solidity
function layout() internal pure returns (struct ERC165Storage.Layout l)
```

### isSupportedInterface

```solidity
function isSupportedInterface(struct ERC165Storage.Layout l, bytes4 interfaceId) internal view returns (bool)
```

### setSupportedInterface

```solidity
function setSupportedInterface(struct ERC165Storage.Layout l, bytes4 interfaceId, bool status) internal
```

## IERC165

_see https://eips.ethereum.org/EIPS/eip-165_

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

Query if a contract implements an interface

_Interface identification is specified in ERC-165. This function
uses less than 30,000 gas._

#### Parameters

| Name        | Type   | Description                                       |
| ----------- | ------ | ------------------------------------------------- |
| interfaceId | bytes4 | The interface identifier, as specified in ERC-165 |

#### Return Values

| Name | Type | Description                                                                                            |
| ---- | ---- | ------------------------------------------------------------------------------------------------------ |
| [0]  | bool | `true` if the contract implements `interfaceId` and `interfaceId` is not 0xffffffff, `false` otherwise |

## IPausable

### Paused

```solidity
event Paused(address account)
```

_Emitted when the pause is triggered by `account`._

### Unpaused

```solidity
event Unpaused(address account)
```

_Emitted when the pause is lifted by `account`._

### paused

```solidity
function paused() external view returns (bool status)
```

query whether contract is paused

#### Return Values

| Name   | Type | Description                |
| ------ | ---- | -------------------------- |
| status | bool | whether contract is paused |

## Pausable

### paused

```solidity
function paused() external view virtual returns (bool status)
```

query whether contract is paused

#### Return Values

| Name   | Type | Description                |
| ------ | ---- | -------------------------- |
| status | bool | whether contract is paused |

## PausableInternal

### whenNotPaused

```solidity
modifier whenNotPaused()
```

### whenPaused

```solidity
modifier whenPaused()
```

### \_paused

```solidity
function _paused() internal view virtual returns (bool status)
```

query whether contract is paused

#### Return Values

| Name   | Type | Description                |
| ------ | ---- | -------------------------- |
| status | bool | whether contract is paused |

### \_pause

```solidity
function _pause() internal virtual
```

Triggers paused state, when contract is unpaused.

### \_unpause

```solidity
function _unpause() internal virtual
```

Triggers unpaused state, when contract is paused.

## PausableStorage

### Layout

```solidity
struct Layout {
  bool paused;
}
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

### layout

```solidity
function layout() internal pure returns (struct PausableStorage.Layout l)
```

## ReentrancyGuard

\_Contract module that helps prevent reentrant calls to a function.

Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
available, which can be applied to functions to make sure there are no nested
(reentrant) calls to them.

Note that because there is a single `nonReentrant` guard, functions marked as
`nonReentrant` may not call one another. This can be worked around by making
those functions `private`, and then adding `external` `nonReentrant` entry
points to them.

TIP: If you would like to learn more about reentrancy and alternative ways
to protect against it, check out our blog post
https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].\_

### nonReentrant

```solidity
modifier nonReentrant()
```

### \_lockReentrancyGuard

```solidity
function _lockReentrancyGuard() internal virtual
```

lock functions that use the nonReentrant modifier

### \_unlockReentrancyGuard

```solidity
function _unlockReentrancyGuard() internal virtual
```

unlock functions that use the nonReentrant modifier

## ReentrancyGuardStorage

### Layout

```solidity
struct Layout {
  uint256 status;
}
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

### layout

```solidity
function layout() internal pure returns (struct ReentrancyGuardStorage.Layout l)
```

## IERC20

_see https://eips.ethereum.org/EIPS/eip-20_

### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

\_Emitted when `value` tokens are moved from one account (`from`) to
another (`to`).

Note that `value` may be zero.\_

### Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

_Emitted when the allowance of a `spender` for an `owner` is set by
a call to {approve}. `value` is the new allowance._

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

query the total minted token supply

#### Return Values

| Name | Type    | Description  |
| ---- | ------- | ------------ |
| [0]  | uint256 | token supply |

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```

query the token balance of given account

#### Parameters

| Name    | Type    | Description      |
| ------- | ------- | ---------------- |
| account | address | address to query |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | uint256 | token balance |

### allowance

```solidity
function allowance(address holder, address spender) external view returns (uint256)
```

query the allowance granted from given holder to given spender

#### Parameters

| Name    | Type    | Description            |
| ------- | ------- | ---------------------- |
| holder  | address | approver of allowance  |
| spender | address | recipient of allowance |

#### Return Values

| Name | Type    | Description     |
| ---- | ------- | --------------- |
| [0]  | uint256 | token allowance |

### approve

```solidity
function approve(address spender, uint256 amount) external returns (bool)
```

grant approval to spender to spend tokens

_prefer ERC20Extended functions to avoid transaction-ordering vulnerability (see https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729)_

#### Parameters

| Name    | Type    | Description                              |
| ------- | ------- | ---------------------------------------- |
| spender | address | recipient of allowance                   |
| amount  | uint256 | quantity of tokens approved for spending |

#### Return Values

| Name | Type | Description                                                    |
| ---- | ---- | -------------------------------------------------------------- |
| [0]  | bool | success status (always true; otherwise function should revert) |

### transfer

```solidity
function transfer(address recipient, uint256 amount) external returns (bool)
```

transfer tokens to given recipient

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| recipient | address | beneficiary of token transfer  |
| amount    | uint256 | quantity of tokens to transfer |

#### Return Values

| Name | Type | Description                                                    |
| ---- | ---- | -------------------------------------------------------------- |
| [0]  | bool | success status (always true; otherwise function should revert) |

### transferFrom

```solidity
function transferFrom(address holder, address recipient, uint256 amount) external returns (bool)
```

transfer tokens to given recipient on behalf of given holder

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| holder    | address | holder of tokens prior to transfer |
| recipient | address | beneficiary of token transfer      |
| amount    | uint256 | quantity of tokens to transfer     |

#### Return Values

| Name | Type | Description                                                    |
| ---- | ---- | -------------------------------------------------------------- |
| [0]  | bool | success status (always true; otherwise function should revert) |

## ERC20Base

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

query the total minted token supply

#### Return Values

| Name | Type    | Description  |
| ---- | ------- | ------------ |
| [0]  | uint256 | token supply |

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```

@inheritdoc IERC20

### allowance

```solidity
function allowance(address holder, address spender) external view returns (uint256)
```

@inheritdoc IERC20

### approve

```solidity
function approve(address spender, uint256 amount) external returns (bool)
```

@inheritdoc IERC20

### transfer

```solidity
function transfer(address recipient, uint256 amount) external returns (bool)
```

@inheritdoc IERC20

### transferFrom

```solidity
function transferFrom(address holder, address recipient, uint256 amount) external returns (bool)
```

@inheritdoc IERC20

## ERC20BaseInternal

### \_totalSupply

```solidity
function _totalSupply() internal view virtual returns (uint256)
```

query the total minted token supply

#### Return Values

| Name | Type    | Description  |
| ---- | ------- | ------------ |
| [0]  | uint256 | token supply |

### \_balanceOf

```solidity
function _balanceOf(address account) internal view virtual returns (uint256)
```

query the token balance of given account

#### Parameters

| Name    | Type    | Description      |
| ------- | ------- | ---------------- |
| account | address | address to query |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | uint256 | token balance |

### \_allowance

```solidity
function _allowance(address holder, address spender) internal view virtual returns (uint256)
```

query the allowance granted from given holder to given spender

#### Parameters

| Name    | Type    | Description            |
| ------- | ------- | ---------------------- |
| holder  | address | approver of allowance  |
| spender | address | recipient of allowance |

#### Return Values

| Name | Type    | Description     |
| ---- | ------- | --------------- |
| [0]  | uint256 | token allowance |

### \_approve

```solidity
function _approve(address holder, address spender, uint256 amount) internal virtual returns (bool)
```

enable spender to spend tokens on behalf of holder

#### Parameters

| Name    | Type    | Description                                 |
| ------- | ------- | ------------------------------------------- |
| holder  | address | address on whose behalf tokens may be spent |
| spender | address | recipient of allowance                      |
| amount  | uint256 | quantity of tokens approved for spending    |

#### Return Values

| Name | Type | Description                                                    |
| ---- | ---- | -------------------------------------------------------------- |
| [0]  | bool | success status (always true; otherwise function should revert) |

### \_decreaseAllowance

```solidity
function _decreaseAllowance(address holder, address spender, uint256 amount) internal
```

decrease spend amount granted by holder to spender

#### Parameters

| Name    | Type    | Description                                 |
| ------- | ------- | ------------------------------------------- |
| holder  | address | address on whose behalf tokens may be spent |
| spender | address | address whose allowance to decrease         |
| amount  | uint256 | quantity by which to decrease allowance     |

### \_spendAllowance

```solidity
function _spendAllowance(address holder, address spender, uint256 amount) internal virtual
```

\_Updates `holder` s allowance for `spender` based on spent `amount`.

Does not update the allowance amount in case of infinite allowance.
Revert if not enough allowance is available.

Might emit an {Approval} event.\_

### \_mint

```solidity
function _mint(address account, uint256 amount) internal virtual
```

mint tokens for given account

#### Parameters

| Name    | Type    | Description                |
| ------- | ------- | -------------------------- |
| account | address | recipient of minted tokens |
| amount  | uint256 | quantity of tokens minted  |

### \_burn

```solidity
function _burn(address account, uint256 amount) internal virtual
```

burn tokens held by given account

#### Parameters

| Name    | Type    | Description               |
| ------- | ------- | ------------------------- |
| account | address | holder of burned tokens   |
| amount  | uint256 | quantity of tokens burned |

### \_transfer

```solidity
function _transfer(address holder, address recipient, uint256 amount) internal virtual returns (bool)
```

transfer tokens from holder to recipient

#### Parameters

| Name      | Type    | Description                       |
| --------- | ------- | --------------------------------- |
| holder    | address | owner of tokens to be transferred |
| recipient | address | beneficiary of transfer           |
| amount    | uint256 | quantity of tokens transferred    |

#### Return Values

| Name | Type | Description                                                    |
| ---- | ---- | -------------------------------------------------------------- |
| [0]  | bool | success status (always true; otherwise function should revert) |

### \_transferFrom

```solidity
function _transferFrom(address holder, address recipient, uint256 amount) internal virtual returns (bool)
```

transfer tokens to given recipient on behalf of given holder

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| holder    | address | holder of tokens prior to transfer |
| recipient | address | beneficiary of token transfer      |
| amount    | uint256 | quantity of tokens to transfer     |

#### Return Values

| Name | Type | Description                                                    |
| ---- | ---- | -------------------------------------------------------------- |
| [0]  | bool | success status (always true; otherwise function should revert) |

### \_beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual
```

ERC20 hook, called before all transfers including mint and burn

_function should be overridden and new implementation must call super_

#### Parameters

| Name   | Type    | Description                    |
| ------ | ------- | ------------------------------ |
| from   | address | sender of tokens               |
| to     | address | receiver of tokens             |
| amount | uint256 | quantity of tokens transferred |

## ERC20BaseStorage

### Layout

```solidity
struct Layout {
  mapping(address => uint256) balances;
  mapping(address => mapping(address => uint256)) allowances;
  uint256 totalSupply;
}
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

### layout

```solidity
function layout() internal pure returns (struct ERC20BaseStorage.Layout l)
```

## IERC20Base

### ERC20Base\_\_ApproveFromZeroAddress

```solidity
error ERC20Base__ApproveFromZeroAddress()
```

### ERC20Base\_\_ApproveToZeroAddress

```solidity
error ERC20Base__ApproveToZeroAddress()
```

### ERC20Base\_\_BurnExceedsBalance

```solidity
error ERC20Base__BurnExceedsBalance()
```

### ERC20Base\_\_BurnFromZeroAddress

```solidity
error ERC20Base__BurnFromZeroAddress()
```

### ERC20Base\_\_InsufficientAllowance

```solidity
error ERC20Base__InsufficientAllowance()
```

### ERC20Base\_\_MintToZeroAddress

```solidity
error ERC20Base__MintToZeroAddress()
```

### ERC20Base\_\_TransferExceedsBalance

```solidity
error ERC20Base__TransferExceedsBalance()
```

### ERC20Base\_\_TransferFromZeroAddress

```solidity
error ERC20Base__TransferFromZeroAddress()
```

### ERC20Base\_\_TransferToZeroAddress

```solidity
error ERC20Base__TransferToZeroAddress()
```

## ERC20Burnable

### burn

```solidity
function burn(uint256 amount) public virtual
```

Destroys `amount` tokens from the caller.

#### Parameters

| Name   | Type    | Description                   |
| ------ | ------- | ----------------------------- |
| amount | uint256 | The amount of tokens to burn. |

### burnFrom

```solidity
function burnFrom(address account, uint256 amount) public virtual
```

Destroys `amount` tokens from `account`, deducting from the caller's
allowance.

#### Parameters

| Name    | Type    | Description                                                                                                                |
| ------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| account | address | The address whose tokens will be burnt.                                                                                    |
| amount  | uint256 | The amount of tokens to burn. Requirements: - the caller must have allowance for `accounts`'s tokens of at least `amount`. |

## ERC20BurnableInternal

### \_burnFrom

```solidity
function _burnFrom(address account, uint256 amount) public virtual
```

## ERC20Metadata

### name

```solidity
function name() external view returns (string)
```

return token name

#### Return Values

| Name | Type   | Description |
| ---- | ------ | ----------- |
| [0]  | string | token name  |

### symbol

```solidity
function symbol() external view returns (string)
```

return token symbol

#### Return Values

| Name | Type   | Description  |
| ---- | ------ | ------------ |
| [0]  | string | token symbol |

### decimals

```solidity
function decimals() external view returns (uint8)
```

return token decimals, generally used only for display purposes

#### Return Values

| Name | Type  | Description    |
| ---- | ----- | -------------- |
| [0]  | uint8 | token decimals |

## ERC20MetadataInternal

### \_name

```solidity
function _name() internal view virtual returns (string)
```

return token name

#### Return Values

| Name | Type   | Description |
| ---- | ------ | ----------- |
| [0]  | string | token name  |

### \_symbol

```solidity
function _symbol() internal view virtual returns (string)
```

return token symbol

#### Return Values

| Name | Type   | Description  |
| ---- | ------ | ------------ |
| [0]  | string | token symbol |

### \_decimals

```solidity
function _decimals() internal view virtual returns (uint8)
```

return token decimals, generally used only for display purposes

#### Return Values

| Name | Type  | Description    |
| ---- | ----- | -------------- |
| [0]  | uint8 | token decimals |

### \_setName

```solidity
function _setName(string name) internal virtual
```

### \_setSymbol

```solidity
function _setSymbol(string symbol) internal virtual
```

### \_setDecimals

```solidity
function _setDecimals(uint8 decimals) internal virtual
```

## ERC20MetadataStorage

### Layout

```solidity
struct Layout {
  string name;
  string symbol;
  uint8 decimals;
}
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

### layout

```solidity
function layout() internal pure returns (struct ERC20MetadataStorage.Layout l)
```

## ERC20Snapshot

### balanceOfAt

```solidity
function balanceOfAt(address account, uint256 snapshotId) public view returns (uint256)
```

Query the token balance of given account at given snapshot id

#### Parameters

| Name       | Type    | Description          |
| ---------- | ------- | -------------------- |
| account    | address | address to query     |
| snapshotId | uint256 | snapshot id to query |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | uint256 | token balance |

### totalSupplyAt

```solidity
function totalSupplyAt(uint256 snapshotId) public view returns (uint256)
```

Query the total minted token supply at given snapshot id

#### Parameters

| Name       | Type    | Description          |
| ---------- | ------- | -------------------- |
| snapshotId | uint256 | snapshot id to query |

#### Return Values

| Name | Type    | Description  |
| ---- | ------- | ------------ |
| [0]  | uint256 | token supply |

## ERC20SnapshotInternal

### \_snapshot

```solidity
function _snapshot() internal virtual returns (uint256)
```

### \_beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual
```

ERC20 hook: update snapshot data

_function should be overridden and new implementation must call super_

#### Parameters

| Name   | Type    | Description                    |
| ------ | ------- | ------------------------------ |
| from   | address | sender of tokens               |
| to     | address | receiver of tokens             |
| amount | uint256 | quantity of tokens transferred |

## ERC20SnapshotStorage

### Snapshots

```solidity
struct Snapshots {
  uint256[] ids;
  uint256[] values;
}
```

### Layout

```solidity
struct Layout {
  mapping(address => struct ERC20SnapshotStorage.Snapshots) accountBalanceSnapshots;
  struct ERC20SnapshotStorage.Snapshots totalSupplySnapshots;
  uint256 snapshotId;
}
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

### layout

```solidity
function layout() internal pure returns (struct ERC20SnapshotStorage.Layout l)
```

## IERC20Burnable

_Extension of {ERC20} that allows holders or approved operators to burn tokens._

### burn

```solidity
function burn(uint256 amount) external
```

Destroys `amount` tokens from the caller.

#### Parameters

| Name   | Type    | Description                   |
| ------ | ------- | ----------------------------- |
| amount | uint256 | The amount of tokens to burn. |

### burnFrom

```solidity
function burnFrom(address account, uint256 amount) external
```

Destroys `amount` tokens from `account`, deducting from the caller's
allowance.

#### Parameters

| Name    | Type    | Description                                                                                                                |
| ------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| account | address | The address whose tokens will be burnt.                                                                                    |
| amount  | uint256 | The amount of tokens to burn. Requirements: - the caller must have allowance for `accounts`'s tokens of at least `amount`. |

## IERC20Metadata

### name

```solidity
function name() external view returns (string)
```

return token name

#### Return Values

| Name | Type   | Description |
| ---- | ------ | ----------- |
| [0]  | string | token name  |

### symbol

```solidity
function symbol() external view returns (string)
```

return token symbol

#### Return Values

| Name | Type   | Description  |
| ---- | ------ | ------------ |
| [0]  | string | token symbol |

### decimals

```solidity
function decimals() external view returns (uint8)
```

return token decimals, generally used only for display purposes

#### Return Values

| Name | Type  | Description    |
| ---- | ----- | -------------- |
| [0]  | uint8 | token decimals |

## IERC20Snapshot

### ERC20Snapshot\_\_SnapshotIdDoesNotExists

```solidity
error ERC20Snapshot__SnapshotIdDoesNotExists()
```

### ERC20Snapshot\_\_SnapshotIdIsZero

```solidity
error ERC20Snapshot__SnapshotIdIsZero()
```

### Snapshot

```solidity
event Snapshot(uint256 id)
```

_Emitted by {\_snapshot} when a snapshot identified by `id` is created._

### balanceOfAt

```solidity
function balanceOfAt(address account, uint256 snapshotId) external view returns (uint256)
```

Query the token balance of given account at given snapshot id

#### Parameters

| Name       | Type    | Description          |
| ---------- | ------- | -------------------- |
| account    | address | address to query     |
| snapshotId | uint256 | snapshot id to query |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | uint256 | token balance |

### totalSupplyAt

```solidity
function totalSupplyAt(uint256 snapshotId) external view returns (uint256)
```

Query the total minted token supply at given snapshot id

#### Parameters

| Name       | Type    | Description          |
| ---------- | ------- | -------------------- |
| snapshotId | uint256 | snapshot id to query |

#### Return Values

| Name | Type    | Description  |
| ---- | ------- | ------------ |
| [0]  | uint256 | token supply |

## AddressUtils

### AddressUtils\_\_InsufficientBalance

```solidity
error AddressUtils__InsufficientBalance()
```

### AddressUtils\_\_NotContract

```solidity
error AddressUtils__NotContract()
```

### AddressUtils\_\_SendValueFailed

```solidity
error AddressUtils__SendValueFailed()
```

### toString

```solidity
function toString(address account) internal pure returns (string)
```

### isContract

```solidity
function isContract(address account) internal view returns (bool)
```

### sendValue

```solidity
function sendValue(address payable account, uint256 amount) internal
```

### functionCall

```solidity
function functionCall(address target, bytes data) internal returns (bytes)
```

### functionCall

```solidity
function functionCall(address target, bytes data, string error) internal returns (bytes)
```

### functionCallWithValue

```solidity
function functionCallWithValue(address target, bytes data, uint256 value) internal returns (bytes)
```

### functionCallWithValue

```solidity
function functionCallWithValue(address target, bytes data, uint256 value, string error) internal returns (bytes)
```

### excessivelySafeCall

```solidity
function excessivelySafeCall(address target, uint256 gasAmount, uint256 value, uint16 maxCopy, bytes data) internal returns (bool success, bytes returnData)
```

execute arbitrary external call with limited gas usage and amount of copied return data

_derived from https://github.com/nomad-xyz/ExcessivelySafeCall (MIT License)_

#### Parameters

| Name      | Type    | Description                                      |
| --------- | ------- | ------------------------------------------------ |
| target    | address | recipient of call                                |
| gasAmount | uint256 | gas allowance for call                           |
| value     | uint256 | native token value to include in call            |
| maxCopy   | uint16  | maximum number of bytes to copy from return data |
| data      | bytes   | encoded call data                                |

#### Return Values

| Name       | Type  | Description                |
| ---------- | ----- | -------------------------- |
| success    | bool  | whether call is successful |
| returnData | bytes | copied return data         |

## AddressUtilsMock

### toString

```solidity
function toString(address account) external pure returns (string)
```

### isContract

```solidity
function isContract(address account) external view returns (bool)
```

### sendValue

```solidity
function sendValue(address payable account, uint256 amount) external
```

### functionCall

```solidity
function functionCall(address target, bytes data) external returns (bytes)
```

### functionCall

```solidity
function functionCall(address target, bytes data, string error) external returns (bytes)
```

### functionCallWithValue

```solidity
function functionCallWithValue(address target, bytes data, uint256 value) external returns (bytes)
```

### functionCallWithValue

```solidity
function functionCallWithValue(address target, bytes data, uint256 value, string error) external returns (bytes)
```

## ArrayUtils

### min

```solidity
function min(bytes32[] array) internal pure returns (bytes32)
```

get minimum value in given array

#### Parameters

| Name  | Type      | Description     |
| ----- | --------- | --------------- |
| array | bytes32[] | array to search |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | bytes32 | minimum value |

### min

```solidity
function min(address[] array) internal pure returns (address)
```

get minimum value in given array

#### Parameters

| Name  | Type      | Description     |
| ----- | --------- | --------------- |
| array | address[] | array to search |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | address | minimum value |

### min

```solidity
function min(uint256[] array) internal pure returns (uint256)
```

get minimum value in given array

#### Parameters

| Name  | Type      | Description     |
| ----- | --------- | --------------- |
| array | uint256[] | array to search |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | uint256 | minimum value |

### max

```solidity
function max(bytes32[] array) internal pure returns (bytes32)
```

get maximum value in given array

#### Parameters

| Name  | Type      | Description     |
| ----- | --------- | --------------- |
| array | bytes32[] | array to search |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | bytes32 | maximum value |

### max

```solidity
function max(address[] array) internal pure returns (address)
```

get maximum value in given array

#### Parameters

| Name  | Type      | Description     |
| ----- | --------- | --------------- |
| array | address[] | array to search |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | address | maximum value |

### max

```solidity
function max(uint256[] array) internal pure returns (uint256)
```

get maximum value in given array

#### Parameters

| Name  | Type      | Description     |
| ----- | --------- | --------------- |
| array | uint256[] | array to search |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | uint256 | maximum value |

## ArrayUtilsMock

### min

```solidity
function min(bytes32[] array) external pure returns (bytes32)
```

### min

```solidity
function min(address[] array) external pure returns (address)
```

### min

```solidity
function min(uint256[] array) external pure returns (uint256)
```

### max

```solidity
function max(bytes32[] array) external pure returns (bytes32)
```

### max

```solidity
function max(address[] array) external pure returns (address)
```

### max

```solidity
function max(uint256[] array) external pure returns (uint256)
```

## IMulticall

### multicall

```solidity
function multicall(bytes[] data) external returns (bytes[] results)
```

batch function calls to the contract and return the results of each

#### Parameters

| Name | Type    | Description                          |
| ---- | ------- | ------------------------------------ |
| data | bytes[] | array of function call data payloads |

#### Return Values

| Name    | Type    | Description                    |
| ------- | ------- | ------------------------------ |
| results | bytes[] | array of function call results |

## Math

### abs

```solidity
function abs(int256 a) internal pure returns (uint256)
```

calculate the absolute value of a number

#### Parameters

| Name | Type   | Description                              |
| ---- | ------ | ---------------------------------------- |
| a    | int256 | number whose absoluve value to calculate |

#### Return Values

| Name | Type    | Description    |
| ---- | ------- | -------------- |
| [0]  | uint256 | absolute value |

### max

```solidity
function max(uint256 a, uint256 b) internal pure returns (uint256)
```

select the greater of two numbers

#### Parameters

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| a    | uint256 | first number  |
| b    | uint256 | second number |

#### Return Values

| Name | Type    | Description    |
| ---- | ------- | -------------- |
| [0]  | uint256 | greater number |

### min

```solidity
function min(uint256 a, uint256 b) internal pure returns (uint256)
```

select the lesser of two numbers

#### Parameters

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| a    | uint256 | first number  |
| b    | uint256 | second number |

#### Return Values

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| [0]  | uint256 | lesser number |

### average

```solidity
function average(uint256 a, uint256 b) internal pure returns (uint256)
```

calculate the average of two numbers, rounded down

_derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)_

#### Parameters

| Name | Type    | Description   |
| ---- | ------- | ------------- |
| a    | uint256 | first number  |
| b    | uint256 | second number |

#### Return Values

| Name | Type    | Description |
| ---- | ------- | ----------- |
| [0]  | uint256 | mean value  |

### sqrt

```solidity
function sqrt(uint256 x) internal pure returns (uint256 y)
```

estimate square root of number

_uses Babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)_

#### Parameters

| Name | Type    | Description  |
| ---- | ------- | ------------ |
| x    | uint256 | input number |

#### Return Values

| Name | Type    | Description |
| ---- | ------- | ----------- |
| y    | uint256 | square root |

## MathMock

### abs

```solidity
function abs(int256 a) external pure returns (uint256)
```

### max

```solidity
function max(uint256 a, uint256 b) external pure returns (uint256)
```

### min

```solidity
function min(uint256 a, uint256 b) external pure returns (uint256)
```

### average

```solidity
function average(uint256 a, uint256 b) external pure returns (uint256)
```

### sqrt

```solidity
function sqrt(uint256 x) external pure returns (uint256)
```

## Multicall

### multicall

```solidity
function multicall(bytes[] data) external returns (bytes[] results)
```

batch function calls to the contract and return the results of each

#### Parameters

| Name | Type    | Description                          |
| ---- | ------- | ------------------------------------ |
| data | bytes[] | array of function call data payloads |

#### Return Values

| Name    | Type    | Description                    |
| ------- | ------- | ------------------------------ |
| results | bytes[] | array of function call results |

## MulticallMock

### callTest

```solidity
function callTest() external pure returns (uint256)
```

### callRevertTest

```solidity
function callRevertTest() external pure
```

## SafeCast

_derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)_

### SafeCast\_\_NegativeValue

```solidity
error SafeCast__NegativeValue()
```

### SafeCast\_\_ValueDoesNotFit

```solidity
error SafeCast__ValueDoesNotFit()
```

### toUint224

```solidity
function toUint224(uint256 value) internal pure returns (uint224)
```

### toUint128

```solidity
function toUint128(uint256 value) internal pure returns (uint128)
```

### toUint96

```solidity
function toUint96(uint256 value) internal pure returns (uint96)
```

### toUint64

```solidity
function toUint64(uint256 value) internal pure returns (uint64)
```

### toUint32

```solidity
function toUint32(uint256 value) internal pure returns (uint32)
```

### toUint16

```solidity
function toUint16(uint256 value) internal pure returns (uint16)
```

### toUint8

```solidity
function toUint8(uint256 value) internal pure returns (uint8)
```

### toUint256

```solidity
function toUint256(int256 value) internal pure returns (uint256)
```

### toInt128

```solidity
function toInt128(int256 value) internal pure returns (int128)
```

### toInt64

```solidity
function toInt64(int256 value) internal pure returns (int64)
```

### toInt32

```solidity
function toInt32(int256 value) internal pure returns (int32)
```

### toInt16

```solidity
function toInt16(int256 value) internal pure returns (int16)
```

### toInt8

```solidity
function toInt8(int256 value) internal pure returns (int8)
```

### toInt256

```solidity
function toInt256(uint256 value) internal pure returns (int256)
```

## UintUtils

_derived from https://github.com/OpenZeppelin/openzeppelin-contracts/ (MIT license)_

### UintUtils\_\_InsufficientHexLength

```solidity
error UintUtils__InsufficientHexLength()
```

### add

```solidity
function add(uint256 a, int256 b) internal pure returns (uint256)
```

### sub

```solidity
function sub(uint256 a, int256 b) internal pure returns (uint256)
```

### toString

```solidity
function toString(uint256 value) internal pure returns (string)
```

### toHexString

```solidity
function toHexString(uint256 value) internal pure returns (string)
```

### toHexString

```solidity
function toHexString(uint256 value, uint256 length) internal pure returns (string)
```

## UintUtilsMock

### add

```solidity
function add(uint256 a, int256 b) external pure returns (uint256)
```

### sub

```solidity
function sub(uint256 a, int256 b) external pure returns (uint256)
```

### toString

```solidity
function toString(uint256 number) external pure returns (string)
```

### toHexString

```solidity
function toHexString(uint256 value) external pure returns (string)
```

### toHexString

```solidity
function toHexString(uint256 value, uint256 length) external pure returns (string)
```
