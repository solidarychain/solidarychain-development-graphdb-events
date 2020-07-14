import { Persisted, Properties } from '../decorators';
import { ResourceType, TransactionType } from '../network.enums';
import { Entity } from '../network.types';
import { BaseModel } from './base.model';
import { Participant } from './participant.model';
import { Goods } from './goods.model';

export class Transaction extends BaseModel {
  @Persisted
  transactionType: TransactionType;

  @Persisted
  resourceType: ResourceType;

  @Persisted
  @Properties({ map: [{ 'entity.id': 'inputEntityId' }, { 'entity.type': 'inputEntityType' }] })
  input: Entity;

  @Persisted
  @Properties({ map: [{ 'entity.id': 'outputEntityId' }, { 'entity.type': 'outputEntityType' }] })
  output: Entity;

  @Persisted
  quantity: number;

  @Persisted
  currency: string;

  @Persisted
  location: string;

  @Persisted
  tags: string[];

  @Persisted
  metaData: any;

  @Persisted
  metaDataInternal: any;

  @Persisted
  createdDate: number;

  @Persisted
  createdByPersonId?: string;

  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;

  @Persisted
  assetId: string;

  goods?: Array<Goods>;
}
