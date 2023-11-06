import Web3 from "web3";
const web3 = new Web3();

export default function predictAddress(factoryAddress: string, salt: any, bytecode: string) {

  // @ts-ignore
  const address = "0x" + web3.utils.sha3('0xff' + factoryAddress.slice(2) + web3.eth.abi.encodeParameter('uint256',salt).slice(2).toString() + web3.utils.sha3(bytecode).slice(2).toString()).slice(-40);
  return address;

};
