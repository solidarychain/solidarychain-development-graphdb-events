import { Persisted, Properties } from "../decorators";
import { BaseModel } from "./base.model";
import { GenericBalance } from "./classes/generic-balance";
import { Goods } from "./goods.model";
import { Entity } from "../network.types";
import { Participant } from "./participant.model";

export class Cause extends BaseModel {
  @Persisted
  @Properties({ returnField: true })
  name: string;

  @Persisted
  @Properties({ returnField: true })
  email: string;

  @Persisted
  ambassadors: string[];

  @Persisted
  startDate: number;

  @Persisted
  endDate: number;

  @Persisted
  location: string;

  @Persisted
  tags: string[];

  @Persisted
  @Properties({ map: [{ 'entity.id': 'inputEntityId' }, { 'entity.type': 'inputEntityType' }] })
  input: Entity;

  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;

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
  @Properties({ map: [{ debit: 'fundsBalanceDebit' }, { credit: 'fundsBalanceCredit' }, { balance: 'fundsBalanceBalance' }] })
  fundsBalance: GenericBalance;

  @Persisted
  @Properties({ map: [{ debit: 'volunteeringHourDebit' }, { credit: 'volunteeringHourCredit' }, { balance: 'volunteeringHourBalance' }] })
  volunteeringHoursBalance: GenericBalance;

  // TODO
  // @Persisted
  goodsStock: Array<Goods>;
}
