import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { QueryResult } from 'neo4j-driver/types/result';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { Persisted, Properties, PersistedUsingInstance, getProperties } from '../decorators';

export class BaseModel {
  @Persisted
  public id: string;

  @Persisted
  public blockNumber: number;

  @Persisted
  public transactionId: string;

  @Persisted
  @Properties({ fieldName: 'transactionStatus' })
  public status: string;

  constructor(
    payload: any, blockNumber?: string, transactionId?: string, status?: string,
  ) {
    Object.assign(this, payload);
    this.blockNumber = Number(blockNumber);
    this.transactionId = transactionId;
    this.status = status;
  }

  private getSaveCypher(): string {
    const showLog = false;
    const queryFields: string[] = [];
    const queryReturnFields: string[] = [];
    const props = Object.entries(this);
    props.forEach((e) => {
      const [k, v] = e;
      // get persisted boolean 
      const persisted = PersistedUsingInstance(this, k);
      // if (returnField && k === 'volunteeringHour') {
      //   debugger;
      // }
      // map property
      if (persisted) {
        // get decorator properties object
        const props = getProperties(this, k);
        const fieldName = (props && props.fieldName) ? props.fieldName : k;
        const returnField = (props && props.returnField) ? props.returnField : null;
        const map: Object[] = (props && props.map) ? props.map : [];
        if (showLog) Logger.log(`k:[${k}], v:[${v}], fieldName:[${fieldName}, Persisted:[${persisted}]]`);
        if (map.length > 0) {
          map.forEach((p) => {
            // if (k === 'input') {
            //   debugger;
            // }
            const [sourceProp, targetProp] = Object.entries(p)[0];
            if (showLog) Logger.debug(`${k}.${sourceProp}=[${this[k][sourceProp]}]: mapped to ${targetProp}: $${k}.${sourceProp}`);
            queryFields.push(`${targetProp}: $${k}.${sourceProp}`)
          });
        } else {
          queryFields.push(`${fieldName}: $${k}`)
        }
        if (returnField) {
          queryReturnFields.push(`n.${fieldName} AS ${fieldName}`);
        }
      }
    });
    if (queryReturnFields.length === 0) {
      queryReturnFields.push('n')
    }
    // compose merge
    return `
      MERGE 
        (n:${this.constructor.name} {
          ${queryFields}
        })
      RETURN 
      ${queryReturnFields}
    `;
  }

  async save(neo4jService: Neo4jService) {
    const cypher = this.getSaveCypher();
    Logger.debug(cypher);
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
