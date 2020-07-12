import { Logger } from '@nestjs/common';
import { BaseModel, Persisted, Properties } from "./base.model";
import { GenericBalance } from "./classes/generic-balance";
import { Goods } from "./goods.model";
import { Neo4jService } from 'src/neo4j/neo4j.service';

export class Participant extends BaseModel {
  @Persisted
  @Properties({ query: 'MATCH', fieldName: 'codeModified' })
  code: string;

  @Persisted
  name: string;

  @Persisted
  email: string;

  @Persisted
  ambassadors: string[];

  @Persisted
  msp: string;

  participant: any;

  identities: Array<any>;

  @Persisted
  metaData: any;

  @Persisted
  metaDataInternal: any;

  @Persisted
  createdDate: number;

  @Persisted
  createdByPersonId?: string;

  loggedPersonId?: string;

  @Persisted
  fundsBalance: GenericBalance;

  @Persisted
  volunteeringHoursBalance: GenericBalance;

  @Persisted
  goodsStock: Array<Goods>;

  constructor(blockNumber: string, transactionId: string, status: string) {
    super(blockNumber, transactionId, status);
  }
}
