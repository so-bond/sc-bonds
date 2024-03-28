// import utils  from 'ethers';
import hre from "hardhat";

// import ethers from 'ethers';

export const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

// Function to get the sighash of a function signature
function getSighash(func: string) {
    const sighash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(func));
    // const sighash = ethers.id(func);
    return sighash;
}

// get function selectors from ABI
export function getSelectors(contract: { abi: ReadonlyArray<any> }): string[] {
    // Create a copy of the abi array to avoid modifying the original
    const abiCopy = [...contract.abi];

    const signatures = abiCopy.filter((item: any) => item.type === 'function').map((item: any) => item.name);
    const selectors = signatures.reduce((acc: string[], val: string) => {
        if (val !== 'init') {
            acc.push(getSighash(val));
        }
        return acc;
    }, []);
    return selectors;
}

// get function selector from function signature
export function getSelector(func: string): string {
    return getSighash(func);
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures
export function remove(functionNames: string[], selectors: string[]): string[] {
    return selectors.filter((v: string) => {
        return !functionNames.some(functionName => v === getSelector(functionName));
    });
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
export function get(functionNames: string[], selectors: string[]): string[] {
    return selectors.filter((v: string) => {
        return functionNames.some(functionName => v === getSelector(functionName));
    });
}

// remove selectors using an array of signatures
export function removeSelectors(selectors: string[], signatures: string[]): string[] {
    const removeSelectors = signatures.map(v => getSighash(v));
    return selectors.filter(v => !removeSelectors.includes(v));
}

// find a particular address position in the return value of diamondLoupeFacet.facets()
export function findAddressPositionInFacets(facetAddress: string, facets: { facetAddress: string }[]): number | undefined {
    for (let i = 0; i < facets.length; i++) {
        if (facets[i].facetAddress === facetAddress) {
            return i;
        }
    }
}