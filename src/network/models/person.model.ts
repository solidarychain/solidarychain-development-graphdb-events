import { BaseModel } from "./base.model";
import { Persisted, Properties } from "../decorators";

export class Person extends BaseModel {
  @Persisted
  @Properties({ returnField: true })
  code: string;

  // constructor(blockNumber: string, transactionId: string, status: string) {
  //   super(blockNumber, transactionId, status);
  // }
}
