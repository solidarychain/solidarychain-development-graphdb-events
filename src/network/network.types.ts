// export type EventFunction = (payload: any) => string;

import { EntityType } from "./network.enums";
import { Cause } from "./models/cause.model";
import { Person } from "./models/person.model";
import { Participant } from "./models/participant.model";

export interface Entity {
  id: string;
  type: EntityType;
  entity: Participant | Person | Cause;
};

/**
 * store array of transaction queries
 */
export type WriteTransaction = {
  cypher: string;
  params?: any;
}

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
}