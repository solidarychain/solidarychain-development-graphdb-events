import { Persisted, Properties } from "../decorators";
import { BaseModel } from "./base.model";
import { GenericBalance } from "./classes/generic-balance";
import { Good } from "./good.model";

export class Participant extends BaseModel {
  @Persisted
  @Properties({ returnField: true })
  code: string;

  @Persisted
  @Properties({ returnField: true })
  name: string;

  @Persisted
  @Properties({ returnField: true })
  email: string;

  @Persisted
  ambassadors: string[];

  @Persisted
  msp: string;

  @Persisted
  @Properties({ map: [{ debit: 'fundsBalanceDebit' }, { credit: 'fundsBalanceCredit' }, { balance: 'fundsBalanceBalance' }] })
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
