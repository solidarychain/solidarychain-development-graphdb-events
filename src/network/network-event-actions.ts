import { Inject, Logger } from '@nestjs/common';
import * as Client from 'fabric-client';
import { Contract } from 'fabric-network';
import { getEnumKeyFromEnumValue } from 'src/main.util';
import { Neo4jService } from "src/neo4j/neo4j.service";
import { Participant } from './models/participant.model';
import { ChaincodeEvent } from "./network.enums";

// type ChaincodeEventFunction = (error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string) => any;

// define class method ChaincodeEvents to manage socket generic actions
export class ChaincodeEventActions {
  constructor(
    private readonly contract: Contract,
    private readonly neo4jService: Neo4jService
  ) {
    this.addContractListener();
  }

  // private chaincodeEventActionMap = new Map<ChaincodeEvent, ChaincodeEventFunction>([
  //   // Asset
  //   [ChaincodeEvent.AssetCreatedEvent, this.chaincodeEventActionAssetCreatedEvent],
  //   [ChaincodeEvent.AssetUpdatedEvent, this.chaincodeEventActionAssetUpdatedEvent],
  //   [ChaincodeEvent.CauseCreatedEvent, this.chaincodeEventActionCauseCreatedEvent],
  //   [ChaincodeEvent.CauseUpdatedEvent, this.chaincodeEventActionCauseUpdatedEvent],
  //   // Participant
  //   [ChaincodeEvent.ParticipantCreatedEvent, this.chaincodeEventActionParticipantCreatedEvent],
  //   [ChaincodeEvent.ParticipantUpdatedEvent, this.chaincodeEventActionParticipantUpdatedEvent],
  //   [ChaincodeEvent.ParticipantChangeIdentityEvent, this.chaincodeEventActionParticipantChangeIdentityEvent],
  //   // Person
  //   [ChaincodeEvent.PersonCreatedEvent, this.chaincodeEventActionPersonCreatedEvent],
  //   [ChaincodeEvent.PersonUpdatedEvent, this.chaincodeEventActionPersonUpdatedEvent],
  //   [ChaincodeEvent.PersonUpdatePasswordEvent, this.chaincodeEventActionPersonUpdatePasswordEvent],
  //   [ChaincodeEvent.PersonUpdateProfileEvent, this.chaincodeEventActionPersonUpdateProfileEvent],
  //   [ChaincodeEvent.PersonUpdateRolesEvent, this.chaincodeEventActionPersonUpdateRolesEvent],
  //   [ChaincodeEvent.PersonUpsertCitizenCardEvent, this.chaincodeEventActionPersonUpsertCitizenCardEvent],
  //   [ChaincodeEvent.PersonAddAttributeEvent, this.chaincodeEventActionPersonAddAttributeEvent],
  //   // Transaction
  //   [ChaincodeEvent.TransactionCreatedEvent, this.chaincodeEventActionTransactionCreatedEvent],
  //   [ChaincodeEvent.TransactionUpdatedEvent, this.chaincodeEventActionTransactionUpdatedEvent],
  //   [ChaincodeEvent.TransactionAssetChangeOwnerEvent, this.chaincodeEventActionTransactionAssetChangeOwnerEvent],
  // ]);

  private async addContractListener() {
    // debugger;
    // this.chaincodeEventActionMap.forEach(async (v: ChaincodeEventFunction, k: ChaincodeEvent) => {
    //   Logger.debug(`add chaincodeEvent: ${k}, delegate to ${v.name}`);
    //   await this.contract.addContractListener(`contract-listener-${k.toLowerCase()}`, k.toString(), (error, event, blockNumber, transactionId, status) => {
    //     v(error, event, blockNumber, transactionId, status);
    //   });
    // });

    // await this.contract.addContractListener(`contract-listener-${'AssetCreatedEvent'.toLowerCase()}`, ChaincodeEvent.AssetCreatedEvent.toString(), (error, event, blockNumber, transactionId, status) => {
    //   this.chaincodeEventActionParticipantCreatedEvent(payload, error, event, blockNumber, transactionId, status);
    // });

    // await this.contract.addContractListener(`contract-listener-${'ParticipantCreatedEvent'.toLowerCase()}`, ChaincodeEvent.ParticipantCreatedEvent.toString(), (error, event, blockNumber, transactionId, status) => {
    //   this.chaincodeEventActionParticipantCreatedEvent(payload, error, event, blockNumber, transactionId, status);
    // });

    await this.contract.addContractListener('contract-listener', '(.*?)', (error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string) => {
      if (error) {
        Logger.error(error);
        return;
      }
      const eventName = (event as any).event_name;
      const eventEnum: ChaincodeEvent = getEnumKeyFromEnumValue(ChaincodeEvent, eventName);
      //convert event to something we can parse 
      let payload = (event as any).payload.toString();
      payload = JSON.parse((payload as any))
      Logger.debug(`Event: ${eventName}, Block Number: ${blockNumber} Transaction ID: ${transactionId} Status: ${status}`);
      Logger.debug(`${eventName}: ${JSON.stringify(payload, undefined, 2)}`);
      // delegateEvent
      this.delegateChaincodeEvent(eventEnum, payload, error, event, blockNumber, transactionId, status);
    });

    // TODO
    // Disconnect from the gateway.
    // await gateway.disconnect();
  } catch(error) {
    Logger.error(`Failed to submit transaction: ${error}`);
  }

  private delegateChaincodeEvent(eventEnum: ChaincodeEvent, payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string) {
    switch (eventEnum) {
      // Asset
      case ChaincodeEvent.AssetCreatedEvent:
        this.chaincodeEventActionAssetCreatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.AssetUpdatedEvent:
        this.chaincodeEventActionAssetUpdatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.CauseCreatedEvent:
        this.chaincodeEventActionCauseCreatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.CauseUpdatedEvent:
        this.chaincodeEventActionCauseUpdatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      // Participant
      case ChaincodeEvent.ParticipantCreatedEvent:
        this.chaincodeEventActionParticipantCreatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.ParticipantUpdatedEvent:
        this.chaincodeEventActionParticipantUpdatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.ParticipantChangeIdentityEvent:
        this.chaincodeEventActionParticipantChangeIdentityEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      // Person
      case ChaincodeEvent.PersonCreatedEvent:
        this.chaincodeEventActionPersonCreatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpdatedEvent:
        this.chaincodeEventActionPersonUpdatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpdatePasswordEvent:
        this.chaincodeEventActionPersonUpdatePasswordEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpdateProfileEvent:
        this.chaincodeEventActionPersonUpdateProfileEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpdateRolesEvent:
        this.chaincodeEventActionPersonUpdateRolesEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpsertCitizenCardEvent:
        this.chaincodeEventActionPersonUpsertCitizenCardEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonAddAttributeEvent:
        this.chaincodeEventActionPersonAddAttributeEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      // Transaction
      case ChaincodeEvent.TransactionCreatedEvent:
        this.chaincodeEventActionTransactionCreatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.TransactionUpdatedEvent:
        this.chaincodeEventActionTransactionUpdatedEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.TransactionAssetChangeOwnerEvent:
        this.chaincodeEventActionTransactionAssetChangeOwnerEvent(payload, error, event, blockNumber, transactionId, status);
        break;
      default:
        Logger.warn(`delegateChaincodeEvent: implement ${eventEnum}`);
        break;
    }
  }

  private chaincodeEventActionAssetCreatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionAssetCreatedEvent`);
  }

  private chaincodeEventActionAssetUpdatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionAssetUpdatedEvent`);
  }

  private chaincodeEventActionCauseCreatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionCauseCreatedEvent`);
  }

  private chaincodeEventActionCauseUpdatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionCauseUpdatedEvent`);
  }

  private chaincodeEventActionParticipantCreatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionParticipantCreatedEvent`);
    let participant: Participant = new Participant();
    Object.assign(participant, payload);
    Logger.debug(participant);
    participant.save(this.neo4jService);
  }

  private chaincodeEventActionParticipantUpdatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionParticipantUpdatedEvent`);
  }

  private chaincodeEventActionParticipantChangeIdentityEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionParticipantChangeIdentityEvent`);
  }

  private chaincodeEventActionPersonCreatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonCreatedEvent`);
  }

  private chaincodeEventActionPersonUpdatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpdatedEvent`);
  }

  private chaincodeEventActionPersonUpdatePasswordEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpdatePasswordEvent`);
  }

  private chaincodeEventActionPersonUpdateProfileEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpdateProfileEvent`);
  }

  private chaincodeEventActionPersonUpdateRolesEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpdateRolesEvent`);
  }

  private chaincodeEventActionPersonUpsertCitizenCardEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpsertCitizenCardEvent`);
  }

  private chaincodeEventActionPersonAddAttributeEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonAddAttributeEvent`);
  }

  private chaincodeEventActionTransactionCreatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionTransactionCreatedEvent`);
  }

  private chaincodeEventActionTransactionUpdatedEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionTransactionUpdatedEvent`);
  }

  private chaincodeEventActionTransactionAssetChangeOwnerEvent(payload: any, error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionTransactionAssetChangeOwnerEvent`);
  }
}
