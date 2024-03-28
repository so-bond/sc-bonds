
import hre from "hardhat";

import { prepareDiamondLoupeFacet } from './prepareFacets/prepareDiamondLoupeFacet';
import { prepareOwnershipFacet } from './prepareFacets/prepareOwnershipFacet';

import { deployDiamond } from './deployDiamond';

async function main() {

    
    // Assuming you have a signer or provider set up in your Hardhat environment
    const signer = await hre.ethers.provider.getSigner();
    const contractOwner = await signer.getAddress();

    const diamondLoupeFacetCut = await prepareDiamondLoupeFacet(contractOwner);
    const ownershipFacetCut = await prepareOwnershipFacet(contractOwner);

    // Define the facets you want to deploy and upgrade the diamond with
    const cut = [
        ownershipFacetCut,
        diamondLoupeFacetCut,
        
    ];

    try {
        const contractAddress = await deployDiamond(cut);
        console.log(`Diamond contract deployed at address: ${contractAddress}`);
    } catch (error) {
        console.error('Deployment failed:', error);
    }
}

// Execute the main function if the script is run directly
if (require.main === module) {
    main();
}

