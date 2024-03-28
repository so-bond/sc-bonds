import hre from "hardhat";
import { readFileSync } from 'fs';
import { join } from 'path';
import { ethers } from 'ethers';

// Define an interface for FacetCut
interface FacetCut {
    facetAddress: string;
    functionSelectors: string[];
}

export async function deployDiamond(cut: FacetCut[]): Promise<void> {
    console.log("Starting Diamond deployment...");

    // Validate the cut parameter
    if (!Array.isArray(cut) || cut.length === 0) {
        throw new Error("Invalid cut parameter. Expected an array of FacetCut objects.");
    }

    // Assuming you have a signer or provider set up in your Hardhat environment
    const signer = await hre.ethers.provider.getSigner();
    const contractOwner = await signer.getAddress();

    // Deploy DiamondCutFacet
    const DiamondCutFacet = await hre.ethers.getContractFactory("DiamondCutFacet");

     // Deploy the contract and get the contract instance
     const diamondCutFacet = await DiamondCutFacet.deploy();
     const diamondCutContract = await diamondCutFacet.waitForDeployment();
     const diamondCutAddress = await diamondCutContract.getAddress();
     console.log(`DiamondCutFacet deployed: ${diamondCutAddress}`);

    // Deploy DiamondInit
    const DiamondInit = await hre.ethers.getContractFactory("DiamondInit");
    const diamondInit = await DiamondInit.deploy();
    const diamondInitContract = await diamondInit.waitForDeployment();
    const diamondInitAddress = await diamondInitContract.getAddress();
    console.log(`DiamondInit deployed: ${diamondInitAddress}`);

    // Deploy Diamond
    const Diamond = await hre.ethers.getContractFactory("Diamond");
    const diamond = await Diamond.deploy(
        contractOwner,
        diamondCutFacet.address,
        cut[0].facetAddress, 
        "0xe4476Ca098Fa209ea457c390BB24A8cfe90FCac4" // Replaced placeholder with actual value
    );
    const diamondContract = await diamond.waitForDeployment();
    const diamondAddress = await diamondContract.getAddress();
    console.log(`Diamond deployed: ${diamondAddress}`);
  
    // const contractAddress = diamond.address; // Corrected line
    
    // Load ABIs
    const diamondCutAbi = JSON.parse(readFileSync(join(__dirname, '../artifacts/contracts/diamond/interfaces/IDiamondCut.sol/IDiamondCut.json'), 'utf8')).abi;  

    // Encode the initialization function call
    const iface = new ethers.Interface(diamondCutAbi);
    const functionCall = iface.encodeFunctionData("init");

    // Upgrade diamond with facets using writeContract
    for (const facetCut of cut) {
        if (!facetCut.facetAddress || !facetCut.functionSelectors || facetCut.functionSelectors.length === 0) {
            console.error("Invalid facet cut:", facetCut);
            continue;
        }

        try {
            const diamondCutTx = await diamond.diamondCut(
                [facetCut],
                diamondInitAddress,
                functionCall
            );
            const diamondCutTxHash = diamondCutTx.hash;
            console.log("Diamond cut tx: ", diamondCutTxHash);
            await diamondCutTx.wait(); // Wait for the transaction to be mined
        } catch (error) {
            console.error("Failed to add facet:", error);
        }
    }

    console.log("Diamond deployment completed.");
    console.log(typeof diamondAddress); 
}