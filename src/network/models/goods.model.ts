import { GenericBalance } from "./classes/generic-balance";

export class Goods {
  code: string;
  barCode: string;
  name: string;
  description: string;
  tags: string[];
  balance?: GenericBalance;
  metaData: any;
  metaDataInternal: any;
  createdDate: number;
  createdByPersonId?: string;
}
