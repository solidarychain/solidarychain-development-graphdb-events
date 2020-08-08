import { Logger } from '@nestjs/common';
import * as Client from 'fabric-client';
import { Contract } from 'fabric-network';
import { getEnumKeyFromEnumValue } from 'src/main.util';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { Asset, Cause, Person, Transaction } from './models';
import { Participant } from './models/participant.model';
import { ChaincodeEvent } from './network.enums';
import { ChaincodeEventActionArguments, ChaincodeEventActionFunction } from './network.types';

// type ChaincodeEventFunction = (error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string) => any;

// define class method ChaincodeEvents to manage socket generic actions
export class ChaincodeEventActions {
  constructor(
    private readonly contract: Contract,
    private readonly neo4jService: Neo4jService,
  ) {
    this.addContractListener();
  }

  private async addContractListener() {
    await this.contract.addContractListener(
      'contract-listener',
      '(.*?)',
      (
        error: Error,
        event?: Client.ChaincodeEvent | Client.ChaincodeEvent[],
        blockNumber?: string,
        transactionId?: string,
        status?: string,
      ) => {
        if (error) {
          Logger.error(error);
          return;
        }
        const eventName = (event as any).event_name;
        const eventEnum: ChaincodeEvent = getEnumKeyFromEnumValue(
          ChaincodeEvent,
          eventName,
        );
        //convert event to something we can parse
        let payload = (event as any).payload.toString();
        payload = JSON.parse(payload as any);
        // Logger.debug(`Event: ${eventName}, Block Number: ${blockNumber} Transaction ID: ${transactionId} Status: ${status}`);
        Logger.debug(`${eventName}: ${JSON.stringify(payload, undefined, 2)}`);
        // delegateEvent
        this.delegateChaincodeEvent(
          eventEnum,
          payload,
          event,
          blockNumber,
          transactionId,
          status,
        );
      },
    ).catch((error) => {
      Logger.error(error);
    });
  }

  private delegateChaincodeEvent(
    eventEnum: ChaincodeEvent,
    payload: any,
    event?: Client.ChaincodeEvent | Client.ChaincodeEvent[],
    blockNumber?: string,
    transactionId?: string,
    status?: string,
  ) {
    const eventActionArgs: ChaincodeEventActionArguments = {
      payload,
      event,
      blockNumber,
      transactionId,
      status,
    };
    // dynamic function with closer bind
    const delegateTo: ChaincodeEventActionFunction = this[`chaincodeEventAction${eventEnum}`].bind(this);
    delegateTo(eventActionArgs);
    // TODO: to clean up
    // switch (eventEnum) {
    //   // Asset
    //   case ChaincodeEvent.AssetCreatedEvent:
    //     this.chaincodeEventActionAssetCreatedEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.AssetUpdatedEvent:
    //     this.chaincodeEventActionAssetUpdatedEvent(eventActionArgs);
    //     break;
    //   // Cause
    //   case ChaincodeEvent.CauseCreatedEvent:
    //     this.chaincodeEventActionCauseCreatedEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.CauseUpdatedEvent:
    //     this.chaincodeEventActionCauseUpdatedEvent(eventActionArgs);
    //     break;
    //   // Participant
    //   case ChaincodeEvent.ParticipantCreatedEvent:
    //     this.chaincodeEventActionParticipantCreatedEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.ParticipantUpdatedEvent:
    //     this.chaincodeEventActionParticipantUpdatedEvent(eventActionArgs);
    //     break;
    //   // Person
    //   case ChaincodeEvent.PersonCreatedEvent:
    //     this.chaincodeEventActionPersonCreatedEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.PersonUpdatedEvent:
    //     this.chaincodeEventActionPersonUpdatedEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.PersonUpdatePasswordEvent:
    //     this.chaincodeEventActionPersonUpdatePasswordEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.PersonUpdateProfileEvent:
    //     this.chaincodeEventActionPersonUpdateProfileEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.PersonUpsertCitizenCardEvent:
    //     this.chaincodeEventActionPersonUpsertCitizenCardEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.PersonAddAttributeEvent:
    //     this.chaincodeEventActionPersonAddAttributeEvent(eventActionArgs);
    //     break;
    //   // Transaction
    //   case ChaincodeEvent.TransactionCreatedEvent:
    //     this.chaincodeEventActionTransactionCreatedEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.TransactionUpdatedEvent:
    //     this.chaincodeEventActionTransactionUpdatedEvent(eventActionArgs);
    //     break;
    //   case ChaincodeEvent.TransactionAssetChangeOwnerEvent:
    //     this.chaincodeEventActionTransactionAssetChangeOwnerEvent(eventActionArgs);
    //     break;
    //   default:
    //     Logger.warn(`delegateChaincodeEvent: implement ${eventEnum}`);
    //     break;
    // }
  }

  private async chaincodeEventActionAssetCreatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    // TODO use ChaincodeEventActionArguments in new Model
    const asset: Asset = new Asset(payload, blockNumber, transactionId, status);
    await asset.save(this.neo4jService).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionAssetUpdatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    const updatedAsset = new Asset({ ...payload });
    const payloadPropKeys = ['ambassadors', 'tags', 'metaData', 'metaDataInternal'];
    await updatedAsset.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionCauseCreatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    // TODO use ChaincodeEventActionArguments in new Model
    const cause: Cause = new Cause(payload, blockNumber, transactionId, status);
    await cause.save(this.neo4jService).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionCauseUpdatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    const updatedCause = new Cause({ ...payload });
    const payloadPropKeys = ['email', 'ambassadors', 'tags', 'metaData', 'metaDataInternal'];
    await updatedCause.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionParticipantCreatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    // TODO use ChaincodeEventActionArguments in new Model
    const participant: Participant = new Participant(payload, blockNumber, transactionId, status);
    await participant.save(this.neo4jService).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionParticipantUpdatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    // TODO require to test: check TODO `'participantUpdated' @high Unauthorized. Requester identity is not an admin`
    const updateParticipant = new Participant({ ...payload });
    const payloadPropKeys = ['email', 'ambassadors', 'metaData', 'metaDataInternal'];
    await updateParticipant.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionPersonCreatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    // TODO use ChaincodeEventActionArguments in new Model
    const person: Person = new Person(payload, blockNumber, transactionId, status);
    await person.save(this.neo4jService).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionPersonUpdatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ ...payload });
    const payloadPropKeys = ['roles', 'metaDataInternal'];
    await updatePerson.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionPersonUpdatePasswordEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ ...payload });
    const payloadPropKeys = ['password'];
    await updatePerson.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionPersonUpdateProfileEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ ...payload });
    const payloadPropKeys = ['email','mobilePhone','postal','city','region','geoLocation','timezone','personalInfo','metaData'];
    await updatePerson.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionPersonUpsertCitizenCardEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ ...payload });
    const payloadPropKeys = ['firstname','lastname','gender','height','fatherFirstname','fatherLastname','motherFirstname','motherLastname','birthDate','nationality','country','documentNumber','documentType','cardVersion','emissionDate','expirationDate','emittingEntity','identityNumber','fiscalNumber','socialSecurityNumber','beneficiaryNumber','pan','requestLocation','otherInformation'];
    await updatePerson.update(this.neo4jService, payloadPropKeys, Person.name).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionPersonAddAttributeEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ ...payload });
    const payloadPropKeys = ['attributes'];
    await updatePerson.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionTransactionCreatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    // TODO use ChaincodeEventActionArguments in new Model
    const transaction: Transaction = new Transaction(payload, blockNumber, transactionId, status);
    await transaction.save(this.neo4jService).catch((error) => Logger.error(error));
    // const writeTransaction: WriteTransaction[] = new Array<WriteTransaction>();
    // writeTransaction.push({ cypher: transaction.getSaveCypher(), params: transaction });
    // const inputType: ModelType = getEnumKeyFromEnumValue(ModelType, transaction.input.type);
    // const outputType: ModelType = getEnumKeyFromEnumValue(ModelType, transaction.output.type);
    // const relation = `MATCH
    //   (a:${inputType} {inputId: $transaction.input.id}),
    //   (b:${outputType} {outputId: $transaction.output.id})
    //   MERGE (a)-[r:LOVES]->(b)`;
    // writeTransaction.push({ cypher: relation, params: transaction });
    // this.neo4jService.writeTransaction(writeTransaction);
  }

  private async chaincodeEventActionTransactionUpdatedEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    const updateTransaction = new Transaction({ ...payload });
    const payloadPropKeys = ['metaDataInternal'];
    await updateTransaction.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error));
  }

  private async chaincodeEventActionTransactionAssetChangeOwnerEvent({ payload, event, blockNumber, transactionId, status }: ChaincodeEventActionArguments): Promise<any> {
    const updateTransaction = new Transaction({ ...payload });
    const payloadPropKeys = ['metaDataInternal'];
    await updateTransaction.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error));
  }
}
