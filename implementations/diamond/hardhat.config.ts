import { HardhatUserConfig, NetworkUserConfig } from "hardhat/types";
import "hardhat-diamond-abi";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "solidity-docgen";
import "@typechain/hardhat";
import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import fs from "fs";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const chainIds = {
  ganache: 1337,
  hardhat: 1337,
  eth: 1,
  eth_goerli: 5,
  eth_sepolia: 11155111,
  polygon_mumbai: 80001,
  polygon: 137,
  avalanche: 43114,
  avalanche_fuji: 43113,
  bsc: 56,
  bsc_testnet: 97,
  celo: 42220,
  celo_testnet: 44787,
  fuse: 122,
  fuse_testnet: 123,
  arbitrum: 42161,
  arbitrum_goerli: 421613,
};

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

task(
  "wallet",
  "Create a wallet (pk) link",
  async (_, { ethers }): Promise<void> => {
    // check if the private key is valid and the file .privateKeyDeploy exists
    try {
      if (fs.existsSync(".privateKeyDeploy")) {
        console.log(".privateKeyDeploy already exists");
        // get the private key from the file
        const _privateKeyDeploy =
          fs.readFileSync(".privateKeyDeploy").toString().trim() || "";
        let wallet = new ethers.Wallet(_privateKeyDeploy);
        console.log("Wallet address:", wallet.address);
      } else {
        const randomWallet = ethers.Wallet.createRandom();
        const privateKey = randomWallet.privateKey;
        fs.writeFileSync(
          `./.generatedWallet/${randomWallet.address}`,
          privateKey,
        );
        fs.writeFileSync(".privateKeyDeploy", privateKey);

        console.log("Private key saved to .privateKeyDeploy");
        console.log(`🔐 WALLET Generated as ${randomWallet.address}`);
      }
    } catch (err) {}
  },
);

task(
  "generate",
  "Force the creation of a new wallet (pk) link",
  async (_, { ethers }): Promise<void> => {
    // check if the private key is valid and the file .privateKeyDeploy exists
    const randomWallet = ethers.Wallet.createRandom();
    const privateKey = randomWallet.privateKey;
    fs.writeFileSync(".privateKeyDeploy", privateKey);
    fs.writeFileSync(`./.generatedWallet/${randomWallet.address}`, privateKey);
    console.log("Private key saved to .privateKeyDeploy");
    console.log(`🔐 WALLET Generated as ${randomWallet.address}`);
  },
);

function createNetworkConfig(
  network: keyof typeof chainIds,
): NetworkUserConfig | any {
  let url: string = "";
  switch (network) {
    case "bsc_testnet":
      url = "https://data-seed-prebsc-1-s1.binance.org:8545";
      break;
    case "eth_sepolia":
      url = "https://rpc2.sepolia.org";
      break;
    case "celo_testnet":
      url = "https://alfajores-forno.celo-testnet.org";
      break;
    case "fuse":
      url = "https://rpc.fuse.io";
      break;
    case "fuse_testnet":
      url = "https://rpc.fusespark.io";
      break;
    case "arbitrum":
      url = "https://arb1.arbitrum.io/rpc";
      break;
    case "arbitrum_goerli":
      url = "https://goerli-rollup.arbitrum.io/rpc";
      break;
    default:
      url = "https://rpc.ankr.com/" + network;
  }
  return {
    _name: network,
    // accounts: [privateKeyDeploy],
    chainId: chainIds[network],
    url: url,
  };
}

const config: HardhatUserConfig | any = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      _name: "localhost",
      chainId: chainIds.hardhat,
    },
    ethereum: createNetworkConfig("eth"),
    goerli: createNetworkConfig("eth_goerli"),
    sepolia: createNetworkConfig("eth_sepolia"),
    mumbai: createNetworkConfig("polygon_mumbai"),
    polygon: createNetworkConfig("polygon"),
    avalanche: createNetworkConfig("avalanche"),
    fuji: createNetworkConfig("avalanche_fuji"),
    binance: createNetworkConfig("bsc"),
    tbinance: createNetworkConfig("bsc_testnet"),
    celo: createNetworkConfig("celo"),
    alfajores: createNetworkConfig("celo_testnet"),
    fuse: createNetworkConfig("fuse"),
    spark: createNetworkConfig("fuse_testnet"),
    arbitrum: createNetworkConfig("arbitrum"),
    arbitrum_goerli: createNetworkConfig("arbitrum_goerli"),
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
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: "USD",
    enabled: true,
  },
  diamondAbi: {
    name: "diamond",
    strict: false,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
  mocha: {
    timeout: 100000000,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
    only: [],
  },
  docgen: {
    output: "docs",
    pages: () => "api.md",
  },
};

export default config;
