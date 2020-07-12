import { Logger } from '@nestjs/common';
import { Contract, FileSystemWallet, Gateway, Network } from 'fabric-network';
import * as path from 'path';
import { readJsonFromFile } from '../main.util';
import { Neo4jService } from '../neo4j/neo4j.service';
import { NetworkConfig } from "./network-config.interface";
import { ChaincodeEventActions } from './network-event-actions';

export class NetworkConnection {
  private wallet: FileSystemWallet;
  private peerIdentity: string;
  private gateway: Gateway;
  private network: Network;
  private contract: Contract;
  private chaincodeEventActions: ChaincodeEventActions;
  // private events: Record<ChaincodeEvent, EventFunction>;

  constructor(private readonly config: NetworkConfig, private readonly neo4jService: Neo4jService) {
    this.init();
  }

  private async init() {
    // connection profile file to object 
    const connectionProfile: any = readJsonFromFile(this.config.connectionFile);
    // wallet
    const walletPath = path.join(process.cwd(), this.config.walletPath);
    this.wallet = new FileSystemWallet(walletPath);
    // peerIdentity
    this.peerIdentity = this.config.peerIdentity;
    // validate user wallet
    await this.validate().catch((error) => {
      Logger.error(error.message);
      process.exit()
    });
    // connect to Fabric Network, starting a new gateway
    this.gateway = new Gateway();
    // use our config file to connect to Fabric network
    await this.gateway.connect(connectionProfile, {
      wallet: this.wallet,
      identity: this.peerIdentity,
      discovery: this.config.gatewayDiscovery
    });
    //connect to our channel
    this.network = await this.gateway.getNetwork(this.config.channelName);
    //connect to contract
    this.contract = await this.network.getContract(this.config.chaincodeName);
    // init events
    // this.initEvents();
    // init ContractListeners after initEvents
    // this.addContractListeners();
    this.chaincodeEventActions = new ChaincodeEventActions(this.contract, this.neo4jService);
  }

  getPeerIdentity() {
    return this.peerIdentity;
  }

  /**
   * validate wallet user, throw error to caller
   */
  private async validate() {
    // Check to see if we've already enrolled the user.
    const userExists = await this.wallet.exists(this.peerIdentity);
    if (!userExists) {
      throw new Error(`An identity for the user '${this.peerIdentity}' does not exist in the wallet, Register '${this.peerIdentity}' first with registerUser.js application before retrying`);
    }
  };

  // private initEvents() {
  //   debugger;
  //   this.events = {
  //     AssetCreatedEvent: (): string => { return `stub for AssetCreatedEvent`}
  //   }
  //   // this.events.AssetCreatedEvent = (): string => { return `stub for AssetCreatedEvent`};
  //   // this.events.AssetUpdatedEvent = (): string => { return `stub for AssetUpdatedEvent`};
  //   // this.events.CauseCreatedEvent = (): string => { return `stub for CauseCreatedEvent`};
  //   const keys = Object.keys(ChaincodeEvent);
  //   // Logger.debug(JSON.stringify(keys, undefined, 2));
  //   keys.forEach((e) => {
  //     // this.events[e] = (): string => { return `stub for ${e}` };
  //   });
  //   // Logger.debug(JSON.stringify(this.events, undefined, 2));
  // }

  // private async addContractListeners() {
  //   await this.contract.addContractListener('my-contract-listener', '(.*?)', (err, event, blockNumber, transactionId, status) => {
  //     if (err) {
  //       console.error(err);
  //       return;
  //     }

  //     //convert event to something we can parse 
  //     event = (event as any).payload.toString();
  //     event = JSON.parse((event as any))

  //     //where we output the Participant
  //     Logger.debug(`Block Number: ${blockNumber} Transaction ID: ${transactionId} Status: ${status}`);
  //     Logger.debug(`${JSON.stringify(event, undefined, 2)}`);
  //   });
  //   // Disconnect from the gateway.
  //   // await gateway.disconnect();
  // } catch(error) {
  //   Logger.error(`Failed to submit transaction: ${error}`);
  // }
}
