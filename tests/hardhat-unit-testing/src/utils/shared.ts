import { EthProviderInterface } from '@saturn-chain/dlt-tx-data-functions';
import { SmartContractInstance } from '@saturn-chain/smart-contract';
import { ethers } from 'hardhat';
import { today } from './dates';

export const RegisterContractName = 'Register';
export const PrimaryIssuanceContractName = 'PrimaryIssuance';
export const BilateralTradeContractName = 'BilateralTrade';
export const CouponTradeContractName = 'Coupon';

export async function bilateralTrade(
  registerInstance: string,
  fromAccount: any,
  toAccount: any,
  qty: number,
  date: number,
  stage: 'draft' | 'pending' | 'accepted' | 'executed' = 'executed'
): Promise<any | undefined> {
  const BilateralTrade = await ethers.getContractFactory('BilateralTrade');
  const tradeInstance = await BilateralTrade.connect(fromAccount).deploy(
    registerInstance,
    toAccount.address
  );

  let _details: any = await tradeInstance.connect(fromAccount).details();

  const details = {
    buyer: _details[1],
    quantity: qty,
    tradeDate: today(),
    valueDate: date,
    price: _details[4]
  };

  await tradeInstance.connect(fromAccount).setDetails(details);

  let _details1: any = await tradeInstance.connect(fromAccount).details();

  if (['pending', 'accepted', 'executed'].includes(stage)) {
    await tradeInstance.connect(fromAccount).approve();

    if (['accepted', 'executed'].includes(stage)) {
      await tradeInstance.connect(toAccount).approve();

      if (['executed'].includes(stage)) {
        await tradeInstance.connect(fromAccount).executeTransfer();
      }
    }
  }

  return tradeInstance;
}
