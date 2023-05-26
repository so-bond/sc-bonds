import { EthProviderInterface } from "@saturn-chain/dlt-tx-data-functions";
import { SmartContractInstance } from "@saturn-chain/smart-contract";
import allContracts from "../contracts";
import { today } from "./dates";

export const RegisterContractName = "Register";
export const PrimaryIssuanceContractName = "PrimaryIssuance";
export const BilateralTradeContractName = "BilateralTrade";
export const CouponTradeContractName = "Coupon";


export async function bilateralTrade(register: SmartContractInstance, from: EthProviderInterface, to: EthProviderInterface, qty: number, date: number,
  stage: "draft"|"pending"|"accepted"|"executed" = "executed")
  : Promise<SmartContractInstance|undefined> {
  // console.log("Creating a bilateral trade", {from:await from.account(), to: await to.account(), qty, stage});

  //deploy bilateral trade
  let trade: SmartContractInstance|undefined = undefined;
  
  trade = await allContracts
  .get(BilateralTradeContractName)
  .deploy(from.newi({ maxGas: 1000000 }), register.deployedAt, await to.account());

  let details = await trade.details(from.call());
  details.quantity = qty;
  details.tradeDate = today();
  details.valueDate = date;
  // console.log("Trade created", trade.deployedAt);

  await trade.setDetails(from.send({ maxGas: 110000 }), details);
  // console.log("Trade updated", trade.deployedAt);

  if (["pending", "accepted", "executed"].includes(stage) ) {
    
    await trade.approve(from.send({ maxGas: 100000 }));
    // console.log("Trade approved by seller", trade.deployedAt);
    
    if (["accepted", "executed"].includes(stage) ) {
      
      await trade.approve(to.send({ maxGas: 100000 }));
      // console.log("Trade approved by buyer", trade.deployedAt);
      
      if (["executed"].includes(stage) ) {
        const gas = await trade.executeTransfer(from.test());
        await trade.executeTransfer(from.send({ maxGas: gas }));
        // console.log("Trade executed", trade.deployedAt, gas);
      }
    }
  }

  return trade;
}