import { Persisted, Properties } from "../decorators";
import { BaseModel } from "./base.model";
import { GenericBalance } from "./classes/generic-balance";
import { Goods } from "./goods.model";

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

  // @Persisted
  goodsStock: Array<Goods>;

  // constructor(blockNumber: string, transactionId: string, status: string) {
  //   super(blockNumber, transactionId, status);
  // }
}
