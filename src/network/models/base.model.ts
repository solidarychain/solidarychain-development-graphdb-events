import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { QueryResult } from 'neo4j-driver/types/result';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { Persisted, Properties, PersistedUsingInstance, getProperties } from '../decorators';
import { removeEmpty } from 'src/main.util';
import { DecoratedProperties } from '../network.types';

export class BaseModel {
  public type: string;

  @Persisted
  @Properties({ fieldName: 'uuid' })
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

  public getDecoratedProperties(): DecoratedProperties {
    const showLog = false;
    const decoratedProperties: DecoratedProperties = {
      queryFields: [],
      queryReturnFields: [],
      queryRelationProperties: '',
    };
    // temp object to save queryRelation objtec with non empty properties
    const relationObject = {};
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
        // if is a mapped field
        if (map.length > 0) {
          map.forEach((p) => {
            // if (k === 'participant') {
            //   debugger;
            // }
            const [sourceProp, targetProp] = Object.entries(p)[0];
            if (showLog) Logger.debug(`${k}.${sourceProp}=[${this[k][sourceProp]}]: mapped to ${targetProp}: $${k}.${sourceProp}`);
            if (this[k]) {
              decoratedProperties.queryFields.push(`${targetProp}: $${k}.${sourceProp}`)
              // decoratedProperties.queryRelationProperties.push(`${targetProp}: $${k}.${sourceProp}`);
            }
          });
        } else {
          if (this[k]) {
            decoratedProperties.queryFields.push(`${fieldName}: $${k}`)
            // decoratedProperties.queryRelationProperties.push(`${fieldName}: $${k}`);
          }
        }
        if (returnField) {
          decoratedProperties.queryReturnFields.push(`n.${fieldName} AS ${fieldName}`);
        }
      }
    });
    // if don't have queryReturnFields RETURN n has default
    if (decoratedProperties.queryReturnFields.length === 0) {
      decoratedProperties.queryReturnFields.push('n')
    }
    // compose queryRelationProperties
    decoratedProperties.queryRelationProperties = decoratedProperties.queryFields.join(',');
    // compose
    return decoratedProperties;
  }

  // public getRelationProps() {
  //   const showLog = true;
  //   const relationProps: string[] = [];
  //   const props = Object.entries(this);
  //   props.forEach((e) => {
  //     const [k, v] = e;
  //     // get persisted boolean 
  //     const persisted = PersistedUsingInstance(this, k);
  //     // map property
  //     if (persisted) {
  //       // get decorator properties object
  //       const props = getProperties(this, k);
  //       const fieldName = (props && props.fieldName) ? props.fieldName : k;
  //       const map: Object[] = (props && props.map) ? props.map : [];
  //       if (showLog) Logger.log(`k:[${k}], v:[${v}], fieldName:[${fieldName}, Persisted:[${persisted}]]`);
  //       if (map.length > 0) {
  //         map.forEach((p) => {
  //           const [sourceProp, targetProp] = Object.entries(p)[0];
  //           if (showLog) Logger.debug(`${k}.${sourceProp}=[${this[k][sourceProp]}]: mapped to ${targetProp}: $${k}.${sourceProp}`);
  //           relationProps.push(`${targetProp}: $${k}.${sourceProp}`)
  //         });
  //       } else {
  //         relationProps.push(`${fieldName}: $relationProperties.$${k}`)
  //       }
  //     }
  //   });
  //   // compose merge
  //   return relationProps;
  // }

  async save(neo4jService: Neo4jService): Promise<any> {
    debugger;
    const { queryFields, queryReturnFields } = this.getDecoratedProperties();
    // compose merge
    const cypher = `
      MERGE 
        (n:${this.constructor.name} {
          ${queryFields}
        })
      RETURN 
      ${queryReturnFields}
    `;

    // Logger.debug(cypher);
    // pass this as parameter object
    const result: void | QueryResult = await neo4jService.write(cypher, this)
      .catch((error) => {
        Logger.error(error);
      });
    if (!result) {
      return {};
    }
    return result.records;
  }

  /**
   * return object without null/empry props
   */
  props() {
    return removeEmpty(this);
  }
}
