// export type EventFunction = (payload: any) => string;
import * as Client from 'fabric-client';
import { Cause } from './models/cause.model';
import { Participant } from './models/participant.model';
import { Person } from './models/person.model';
import { EntityType } from './network.enums';

export interface Entity {
  id: string;
  type: EntityType;
  entity: Participant | Person | Cause;
}

/**
 * store array of transaction queries
 */
export type WriteTransaction = {
  cypher: string;
  params?: any;
};

/**
 * store composed Decorated Properties
 */
export type DecoratedProperties = {
  // araay of strings with field: $param.prop ex "id: $id"...
  queryFields: string[];
  // araay of strings with node "n"...
  queryReturnFields: string[];
  // araay of strings with field=$param.prop ex "id=$id"...
  querySetFields: string[];
  // string with composed field:$param.prop separated by comma "id:$id, transactionType:$transactionType..."
  queryRelationProperties: string;
  // string with composed field=$param.prop separated by comma "id=$id ,transactionType=$transactionType..."
  querySetProperties: string;
};

/**
 * used has a dto to pass one object to chaincodeEventAction*Event functions, and keep code cleaner
 * ex `chaincodeEventActionAssetCreatedEvent({payload, blockNumber, transactionId, status}: ChaincodeEventActionArguments): any {...`
 */
export type ChaincodeEventActionArguments = {
  payload: any,
  blockNumber?: string,
  transactionId?: string,
  status?: string,
  event?: Client.ChaincodeEvent | Client.ChaincodeEvent[],
}

// dynamic function type used in delegateTo to chaincodeEventAction
export type ChaincodeEventActionFunction = (args: ChaincodeEventActionArguments) => any;