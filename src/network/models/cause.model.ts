import { Persisted, Properties } from "../decorators";
import { Entity } from "../network.types";
import { BaseModel } from "./base.model";
import { GenericBalance } from "./classes/generic-balance";
import { Good } from "./good.model";
import { Participant } from ".";

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
  @Properties({ map: [{ debit: 'fundsDebit' }, { credit: 'fundsCredit' }, { balance: 'fundsBalance' }] })
  fundsBalance: GenericBalance;

  @Persisted
  @Properties({ map: [{ debit: 'volunteeringHourDebit' }, { credit: 'volunteeringHourCredit' }, { balance: 'volunteeringHourBalance' }] })
  volunteeringHoursBalance: GenericBalance;

  goodsStock: Array<Good>;

  // don't put in base, else we hav circular dependency problems
  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;
}
