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
  queryFields: string[];
  queryReturnFields: string[];
  queryRelationProperties: string;
}