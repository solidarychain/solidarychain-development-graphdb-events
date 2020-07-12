import { Logger } from '@nestjs/common';
import { BaseModel } from "./base.model";
import { GenericBalance } from "./classes/generic-balance";
import { Goods } from "./goods.model";

export class Participant extends BaseModel {
  code: string;
  name: string;
  email: string;
  ambassadors: string[];
  msp: string;
  participant: any;
  identities: Array<any>;
  metaData: any;
  metaDataInternal: any;
  createdDate: number;
  createdByPersonId?: string;
  loggedPersonId?: string;
  fundsBalance: GenericBalance;
  volunteeringHoursBalance: GenericBalance;
  goodsStock: Array<Goods>;

  save() {
    Logger.debug(`stub for save model Participant`);
  }
}
