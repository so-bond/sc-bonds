// import hre from "hardhat";

// async function main() {
//  // Fetch the signer (account) to deploy the contract with
//  const [deployer] = await hre.ethers.getSigners();

//  console.log("Deploying contracts with the account:", deployer.address);

//  // Compile the contract if not already done
//  await hre.run("compile");

//  // Deploy the InvestorManagement contract
//  const InvestorManagement = await hre.ethers.getContractFactory("InvestorManagement");
//  const investorManagement = await InvestorManagement.deploy();

//  // The contract instance should be ready to use after the deploy method resolves
//  console.log("InvestorManagement deployed to:", investorManagement.address);
// }

// main()
//  .then(() => process.exit(0))
//  .catch((error) => {
//     console.error(error);
//     process.exit(1);
//  });