import { EthProviderInterface } from "@saturn-chain/dlt-tx-data-functions";
import { EventReceiver, SmartContractInstance } from "@saturn-chain/smart-contract";
import { EventData } from "web3-eth-contract";

function cleanLog(log: EventData): EventData {
  const values = {...log.returnValues}
  for (const key in Object.keys(values)) {
    if (!Number.isNaN(Number.parseInt(key))) {
      delete values[key]
    }
  }
  return {...log, returnValues: values};
}

export class InstanceEvents {
  receiver: EventReceiver|undefined;
  events: EventData[];
  private readyPromise: Promise<void>;
  constructor(intf: EthProviderInterface, public instance: SmartContractInstance) {
    this.events = [];
    this.readyPromise = new Promise( (resolve, reject)=>{
      const history = this.instance.allEvents(intf.get(), {})
      history.on("log", log=>{
        this.events.push(cleanLog(log))
      });
      history.on("completed", ()=>{
        history.removeAllListeners();
        resolve();
      })
      history.on("error", reject);
      this.receiver = instance.allEvents(intf.sub(), {});
      this.receiver.on("log", log=>{
        this.events.push(cleanLog(log))
      })
    })
  }
  async ready(): Promise<boolean> {
    if (!this.readyPromise) return false;
    await this.readyPromise
    return true;
  }
  close() {
    if (this.receiver) this.receiver.removeAllListeners();
  }
  print() {
    for (const log of this.events) {
      console.log(`LOG ${log.blockNumber}:${log.transactionIndex}:${log.logIndex} > ${log.event}(${JSON.stringify(log.returnValues)})`);
    }
  }
  has(eventName: string, filter: any): number {
    let found = this.events.filter(log=>log.event == eventName)
    found = found.filter(log=>{
      for (const key of Object.keys(filter)) {
        if (log.returnValues[key] != filter[key]) return false;
      }
      return true;
    })
    return found.length;
  }
}

const eventsMap: Map<string, InstanceEvents> = new Map()
    
export async function collectEvents(intf: EthProviderInterface, instance: SmartContractInstance): Promise<void> {
  if (eventsMap.has(instance.deployedAt)) return;
  const ev = new InstanceEvents(intf, instance);
  await ev.ready()
  eventsMap.set(instance.deployedAt,  ev)
}

export function closeEvents() {
  eventsMap.forEach( ev=>ev.close())
}

export function getEvents(instance: SmartContractInstance): InstanceEvents {
  const inst = eventsMap.get(instance.deployedAt)
  if (!inst) throw new Error("No Events subscribed for this instance. Did you call captureEvents before");
  return inst;
}