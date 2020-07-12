import { Logger } from '@nestjs/common';
import { BaseModel } from "./base.model";
import { GenericBalance } from "./classes/generic-balance";
import { Goods } from "./goods.model";
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { QueryResult } from 'neo4j-driver/types/result';

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

  async save(neo4jService: Neo4jService) {
    const cypher = `
        MERGE 
          (n:Participant {
            code: $code, 
            name: $name
          })
        RETURN 
          n.code AS code,  
          n.name as name
      `;
    const result: void | QueryResult = await neo4jService.write(cypher, this)
      .catch((error) => {
        Logger.error(error);
      });
    if (!result) {
      return {};
    }
    return result.records;
  }
}
