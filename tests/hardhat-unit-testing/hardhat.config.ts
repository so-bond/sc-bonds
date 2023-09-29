import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-docgen";
import "./hardhat-plugings/combined-json"

const config: HardhatUserConfig = {
  paths: {
    root: "../..", // force hardhat to position itself in the root folder of the source to compile
    sources: "initial-eib-impl/src", // location of the solidity files
    tests: "tests/hardhat-unit-testing/src", // based on root, the location of the tests
    cache: "initial-eib-impl/cache",
    artifacts: "initial-eib-impl/artifacts",
  },
  solidity: {
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
    only: [],
  },
};

export default config;
