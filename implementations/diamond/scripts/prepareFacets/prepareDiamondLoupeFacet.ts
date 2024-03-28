import hre from "hardhat";
import { FacetCutAction, getSelectors } from "../libraries/diamond";

export async function prepareDiamondLoupeFacet(contractOwner: string): Promise<any> {
    console.log("Deploying DiamondLoupeFacet");
    const DiamondLoupeFacet = await hre.ethers.getContractFactory("DiamondLoupeFacet");
    try {
        // Deploy the contract and get the contract instance
        const facet = await DiamondLoupeFacet.deploy();
        const facetContract = await facet.waitForDeployment();
        // console.log(facetContract);
        const facetAddress = await facetContract.getAddress();
        // The contract instance is ready to use, so no need to wait for the transaction
        console.log(`DiamondLoupeFacet deployed: ${facetAddress}`);

        // Check if the facet address is correctly retrieved
        if (!facetAddress) {
            throw new Error("Failed to retrieve the deployed contract address.");
        }

        const selectors = getSelectors({ abi: facet.interface.fragments });
        const cut = {
            action: FacetCutAction.Add,
            facetAddress: facetAddress,
            functionSelectors: selectors,
        };
        return cut;
    } catch (error) {
        console.error("Error deploying DiamondLoupeFacet:", error);
        throw error; // Rethrow the error to ensure it's handled by the caller
    }
}