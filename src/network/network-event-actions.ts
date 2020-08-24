import { Logger } from '@nestjs/common';
import * as Client from 'fabric-client';
import { Contract } from 'fabric-network';
import { getEnumKeyFromEnumValue, writeJsonToFile } from 'src/main.util';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { Asset, Cause, Person, Transaction } from './models';
import { Participant } from './models/participant.model';
import { ChaincodeEvent } from './network.enums';
import { ChaincodeEventActionArguments, ChaincodeEventActionFunction } from './network.types';
import { NetworkConfig } from './network-config.interface';

// type ChaincodeEventFunction = (error: Error, event?: Client.ChaincodeEvent | Client.ChaincodeEvent[], blockNumber?: string, transactionId?: string, status?: string) => any;

// define class method ChaincodeEvents to manage socket generic actions
export class NetworkEventActions {
  constructor(
    private readonly contract: Contract,
    private readonly neo4jService: Neo4jService,
    private readonly config: NetworkConfig,
  ) {
    this.addContractListener();
  }

  private async addContractListener() {
    await this.contract.addContractListener('contract-listener', '(.*?)',
      async (
        error: Error,
        event?: Client.ChaincodeEvent | Client.ChaincodeEvent[],
        blockNumber?: string,
        transactionId?: string,
        status?: string,
      ) => {
        if (error) {
          Logger.error(error, NetworkEventActions.name);
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
        const data = { blockNumber, transactionId, status, event: eventEnum, payload };
        // don't need to use wait here, use it asyncrounous to not block addContractListener
        writeJsonToFile(`${process.env.NETWORK_SAVE_EVENTS_PATH}/${blockNumber.toString().padStart(12, '0')}.${transactionId}.json`, JSON.stringify(data, undefined, 2))
          .catch((error) => Logger.error(error, NetworkEventActions.name));
        Logger.debug(`Node Received Event: ${eventName}, Block Number: ${blockNumber} Transaction ID: ${transactionId} Status: ${status}, Node priority: ${this.config.nodePriority}`, NetworkEventActions.name);
        // Logger.debug(JSON.stringify(payload, undefined, 2), ChaincodeEventActions.name);
        setTimeout(async () => {
          // delegateEvent
          await this.delegateChaincodeEvent(
            eventEnum,
            payload,
            event,
            blockNumber,
            transactionId,
            status,
          );
        }, this.config.nodePriority * this.config.nodePriorityTimeout);
      },
    ).catch((error) => {
      Logger.error(error, NetworkEventActions.name);
    });
  }

  private async delegateChaincodeEvent(
    eventEnum: ChaincodeEvent,
    payload: any,
    event?: Client.ChaincodeEvent | Client.ChaincodeEvent[],
    blockNumber?: string,
    transactionId?: string,
    status?: string,
  ) {
    const eventActionArgs: ChaincodeEventActionArguments = {
      payload,
      blockNumber,
      transactionId,
      status,
      event,
    };
    // compose dynamic function with closure bind
    const delegateTo: ChaincodeEventActionFunction = this[`chaincodeEventAction${eventEnum}`].bind(this);
    await delegateTo(eventActionArgs);
  }

  private async chaincodeEventActionAssetCreatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const asset: Asset = new Asset({ payload, blockNumber, transactionId, status, event });
    await asset.save(this.neo4jService).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionAssetUpdatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const updatedAsset = new Asset({ payload, blockNumber, transactionId, status, event });
    const payloadPropKeys = ['ambassadors', 'tags', 'metaData', 'metaDataInternal'];
    await updatedAsset.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionCauseCreatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const cause: Cause = new Cause({ payload, blockNumber, transactionId, status, event });
    await cause.save(this.neo4jService).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionCauseUpdatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const updatedCause = new Cause({ payload, blockNumber, transactionId, status, event });
    const payloadPropKeys = ['email', 'ambassadors', 'tags', 'metaData', 'metaDataInternal'];
    await updatedCause.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionParticipantCreatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const participant: Participant = new Participant({ payload, blockNumber, transactionId, status, event });
    await participant.save(this.neo4jService).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionParticipantUpdatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    // TODO require to test: check TODO `'participantUpdated' @high Unauthorized. Requester identity is not an admin`
    const updateParticipant = new Participant({ payload, blockNumber, transactionId, status, event });
    const payloadPropKeys = ['email', 'ambassadors', 'metaData', 'metaDataInternal'];
    await updateParticipant.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionPersonCreatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const person: Person = new Person({ payload, blockNumber, transactionId, status, event });
    await person.save(this.neo4jService).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionPersonUpdatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ payload, blockNumber, transactionId, status, event });
    const payloadPropKeys = ['roles', 'metaDataInternal'];
    await updatePerson.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionPersonUpdatePasswordEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ payload, blockNumber, transactionId, status, event });
    const payloadPropKeys = ['password'];
    await updatePerson.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionPersonUpdateProfileEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ payload, blockNumber, transactionId, status, event });
    const payloadPropKeys = ['email', 'mobilePhone', 'postal', 'city', 'region', 'geoLocation', 'timezone', 'personalInfo', 'metaData'];
    await updatePerson.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionPersonUpsertCitizenCardEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ payload, blockNumber, transactionId, status, event });
    const payloadPropKeys = ['firstname', 'lastname', 'gender', 'height', 'fatherFirstname', 'fatherLastname', 'motherFirstname', 'motherLastname', 'birthDate', 'nationality', 'country', 'documentNumber', 'documentType', 'cardVersion', 'emissionDate', 'expirationDate', 'emittingEntity', 'identityNumber', 'fiscalNumber', 'socialSecurityNumber', 'beneficiaryNumber', 'pan', 'requestLocation', 'otherInformation'];
    await updatePerson.update(this.neo4jService, payloadPropKeys, Person.name).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionPersonAddAttributeEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const updatePerson = new Person({ payload, blockNumber, transactionId, status, event });
    const payloadPropKeys = ['attributes'];
    await updatePerson.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionTransactionCreatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const transaction: Transaction = new Transaction({ payload, blockNumber, transactionId, status, event });
    await transaction.save(this.neo4jService).catch((error) => Logger.error(error, NetworkEventActions.name));
  }

  private async chaincodeEventActionTransactionUpdatedEvent({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments): Promise<any> {
    const updateTransaction = new Transaction({ payload, blockNumber, transactionId, status, event });
    const payloadPropKeys = ['metaDataInternal'];
    await updateTransaction.update(this.neo4jService, payloadPropKeys).catch((error) => Logger.error(error, NetworkEventActions.name));
  }
}
