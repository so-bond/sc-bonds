import hre from "hardhat";
import { FacetCutAction, getSelectors } from "../libraries/diamond";

export async function prepareOwnershipFacet(contractOwner: string): Promise<any> {
    console.log("Deploying OwnershipFacet");
    const OwnershipFacet = await hre.ethers.getContractFactory("OwnershipFacet");
    try {
        // Deploy the contract and get the contract instance
        // const facet = await OwnershipFacet.deploy();
        // await facet.deployed(); // This line ensures the contract is deployed and the address is available
        // console.log(`OwnershipFacet deployed: ${facet.address}`);


         // Deploy the contract and get the contract instance
         const facet = await OwnershipFacet.deploy();
         const facetContract = await facet.waitForDeployment();
         // console.log(facetContract);
         const facetAddress = await facetContract.getAddress();
         // The contract instance is ready to use, so no need to wait for the transaction
         console.log(`OwnershipFacet deployed: ${facetAddress}`);
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
        console.error("Error deploying OwnershipFacet:", error);
        throw error; // Rethrow the error to ensure it's handled by the caller
    }
}