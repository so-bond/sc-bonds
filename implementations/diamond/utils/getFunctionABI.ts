import Web3 from "web3";
const web3 = new Web3();

export default function getFunctionABI(artifact: any, functionName: string) {    
    const abi = artifact.abi;
    // @ts-ignore
    const functionABI = abi.filter(item => item.type === "function" && item.name === functionName)[0];
    return functionABI;
}
