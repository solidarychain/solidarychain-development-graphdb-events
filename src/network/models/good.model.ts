import { GenericBalance } from "./classes/generic-balance";
import { BaseModel } from "./base.model";
import { Persisted, Properties } from "../decorators";
import { Participant } from "./participant.model";

export class Good extends BaseModel {
  @Persisted
  code: string;

  @Persisted
  barCode: string;

  @Persisted
  name: string;

  @Persisted
  description: string;

  @Persisted
  tags: string[];

  @Persisted
  @Properties({ map: [{ debit: 'balanceDebit' }, { credit: 'balanceCredit' }, { balance: 'balanceBalance' }] })
  balance?: GenericBalance;

  // don't put in base, else we hav circular dependency problems
  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;
}
