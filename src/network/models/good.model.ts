import { Persisted, Properties } from '../decorators';
import { GenericBalance } from './classes/generic-balance';
import { BaseModel } from './base.model';
import { Participant } from './participant.model';

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

  // SET'ed mannually, require to SUM/Increment
  // @Persisted
  // @Properties({ map: [{ debit: 'balanceDebit' }, { credit: 'balanceCredit' }, { balance: 'balanceBalance' }] })
  balance?: GenericBalance;

  // don't put in base, else we have circular dependency problems
  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;
}
