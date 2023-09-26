import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-docgen";
const stripHexPrefix = require("strip-hex-prefix");

task("combined-json", "Generates a combined JSON file for all contracts")
  .addParam("output", "The output file name for the combined JSON file")
  .setAction(async (taskArgs, hre) => {
    console.log("Generating combined JSON file for all contracts...");
    const fqns = await hre.artifacts.getAllFullyQualifiedNames();

    if (fqns.length == 0) {
      console.log("No artifacts found. Please compile contracts first.");
      return;
    }

    // will receive an array of the different compiler versions used
    const versions: string[] = []; //[taskArgs.version];
    // will receive the JSON data for the combined.json file to be produced.
    // the structure of the file is:
    // - contracts:
    //  - <contract_fully_qualified_name>
    //    - abi
    //    - bin
    //    - bin-runtime
    // - version
    const combined: any = { contracts: {} };

    for (const fqn of fqns) {
      // skip the combined.json file itself
      if (fqn == ":combined") continue;
      // process the fqn of the smart contract compiled
      const bi = await hre.artifacts.getBuildInfo(fqn);
      if (bi && !versions.includes(bi.solcLongVersion)) {
        versions.push(bi.solcLongVersion);
      }
      const artifact = await hre.artifacts.readArtifact(fqn);
      combined.contracts[fqn] = {
        abi: artifact.abi,
        bin: stripHexPrefix(artifact.bytecode),
        "bin-runtime": stripHexPrefix(artifact.deployedBytecode),
      };
    }
    combined.version = versions.join(";");

    const fs = require("fs");
    const path = require("path");
    // use the output file name provided as a parameter
    const location = path.join(process.cwd(), taskArgs.output);
    console.log("Generating", location);
    fs.writeFileSync(location, JSON.stringify(combined), { flag: "w" });
    console.log(
      "Attention, other hardhat command may delete de combined.json file. Please, check it after running a command.",
    );
  });

const config: HardhatUserConfig = {
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
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
        version: "0.8.19",
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
