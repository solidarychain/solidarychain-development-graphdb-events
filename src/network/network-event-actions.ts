import { Logger } from '@nestjs/common';
import * as Client from 'fabric-client';
import { Contract } from 'fabric-network';
import { getEnumKeyFromEnumValue } from 'src/main.util';
import { Neo4jService } from "src/neo4j/neo4j.service";
import { Transaction, Cause, Person, Asset } from './models';
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

  private async addContractListener() {
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
      // Logger.debug(`Event: ${eventName}, Block Number: ${blockNumber} Transaction ID: ${transactionId} Status: ${status}`);
      Logger.debug(`${eventName}: ${JSON.stringify(payload, undefined, 2)}`);
      // delegateEvent
      this.delegateChaincodeEvent(eventEnum, payload, event, blockNumber, transactionId, status);
    });

    // TODO
    // Disconnect from the gateway.
    // await gateway.disconnect();
  } catch(error) {
    Logger.error(`Failed to submit transaction: ${error}`);
  }

  private delegateChaincodeEvent(eventEnum: ChaincodeEvent, payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string) {
    switch (eventEnum) {
      // Asset
      case ChaincodeEvent.AssetCreatedEvent:
        this.chaincodeEventActionAssetCreatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.AssetUpdatedEvent:
        this.chaincodeEventActionAssetUpdatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.CauseCreatedEvent:
        this.chaincodeEventActionCauseCreatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.CauseUpdatedEvent:
        this.chaincodeEventActionCauseUpdatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      // Participant
      case ChaincodeEvent.ParticipantCreatedEvent:
        this.chaincodeEventActionParticipantCreatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.ParticipantUpdatedEvent:
        this.chaincodeEventActionParticipantUpdatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.ParticipantChangeIdentityEvent:
        this.chaincodeEventActionParticipantChangeIdentityEvent(payload, event, blockNumber, transactionId, status);
        break;
      // Person
      case ChaincodeEvent.PersonCreatedEvent:
        this.chaincodeEventActionPersonCreatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpdatedEvent:
        this.chaincodeEventActionPersonUpdatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpdatePasswordEvent:
        this.chaincodeEventActionPersonUpdatePasswordEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpdateProfileEvent:
        this.chaincodeEventActionPersonUpdateProfileEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpdateRolesEvent:
        this.chaincodeEventActionPersonUpdateRolesEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonUpsertCitizenCardEvent:
        this.chaincodeEventActionPersonUpsertCitizenCardEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.PersonAddAttributeEvent:
        this.chaincodeEventActionPersonAddAttributeEvent(payload, event, blockNumber, transactionId, status);
        break;
      // Transaction
      case ChaincodeEvent.TransactionCreatedEvent:
        this.chaincodeEventActionTransactionCreatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.TransactionUpdatedEvent:
        this.chaincodeEventActionTransactionUpdatedEvent(payload, event, blockNumber, transactionId, status);
        break;
      case ChaincodeEvent.TransactionAssetChangeOwnerEvent:
        this.chaincodeEventActionTransactionAssetChangeOwnerEvent(payload, event, blockNumber, transactionId, status);
        break;
      default:
        Logger.warn(`delegateChaincodeEvent: implement ${eventEnum}`);
        break;
    }
  }

  private chaincodeEventActionAssetCreatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    const asset: Asset = new Asset(payload, blockNumber, transactionId, status);
    asset.save(this.neo4jService);
  }

  private chaincodeEventActionAssetUpdatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionAssetUpdatedEvent`);
  }

  private chaincodeEventActionCauseCreatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    const cause: Cause = new Cause(payload, blockNumber, transactionId, status);
    cause.save(this.neo4jService);
  }

  private chaincodeEventActionCauseUpdatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionCauseUpdatedEvent`);
  }

  private chaincodeEventActionParticipantCreatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    const participant: Participant = new Participant(payload, blockNumber, transactionId, status);
    participant.save(this.neo4jService);
  }

  private chaincodeEventActionParticipantUpdatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionParticipantUpdatedEvent`);
  }

  private chaincodeEventActionParticipantChangeIdentityEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionParticipantChangeIdentityEvent`);
  }

  private chaincodeEventActionPersonCreatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    const person: Person = new Person(payload, blockNumber, transactionId, status);
    person.save(this.neo4jService);
  }

  private chaincodeEventActionPersonUpdatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpdatedEvent`);
  }

  private chaincodeEventActionPersonUpdatePasswordEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpdatePasswordEvent`);
  }

  private chaincodeEventActionPersonUpdateProfileEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpdateProfileEvent`);
  }

  private chaincodeEventActionPersonUpdateRolesEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpdateRolesEvent`);
  }

  private chaincodeEventActionPersonUpsertCitizenCardEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonUpsertCitizenCardEvent`);
  }

  private chaincodeEventActionPersonAddAttributeEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionPersonAddAttributeEvent`);
  }

  private chaincodeEventActionTransactionCreatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    const transaction: Transaction = new Transaction(payload, blockNumber, transactionId, status);
    transaction.save(this.neo4jService);
  }

  private chaincodeEventActionTransactionUpdatedEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionTransactionUpdatedEvent`);
  }

  private chaincodeEventActionTransactionAssetChangeOwnerEvent(payload: any, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string): any {
    Logger.warn(`implement stub for chaincodeEventActionTransactionAssetChangeOwnerEvent`);
  }
}
