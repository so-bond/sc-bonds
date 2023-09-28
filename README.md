# Bond smart contracts based on `so | bond` model 

## getting started

You are at the root of this repo that contains folders for the implementations and folders for the tests.

- initial-eib-impl : contains the smart contract implementation of the initial EIB bond issued in june 2023 on PoCRNet by CACIB and SEB
- tests
  -  original-unit-testing : contains the original unit tests for the initial EIB bond implementation that can be used for the validation of other implementations. It uses the `combined.json` file in the `contracts` folder.



### Get started commands

- install `npm i` will also run install of modules for the subfolders
- build contract using solidity : `npm run build` will build all implementations
- run tests by going into each of the tests/* folders and run `npm run test`

## Other considerations

the root package.json contains installs dependencies
- the @saturn-chain/smart-contract package that is needed for the `contracts` to work as a node package and be at the root of the repo to be used as output of multiple implementations
- the @so-bond/interfaces package that contains the interfaces for the smart contracts and is used by the implementations and the tests (or should be - not yet the case)