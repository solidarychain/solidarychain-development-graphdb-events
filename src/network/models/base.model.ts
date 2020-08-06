import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { QueryResult } from 'neo4j-driver/types/result';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import {
  Persisted,
  Properties,
  PersistedUsingInstance,
  getProperties,
} from '../decorators';
import { removeEmpty, getEnumKeyFromEnumValue } from 'src/main.util';
import { DecoratedProperties } from '../network.types';
import { ModelType } from '../network.enums';

export class BaseModel {
  public type: string;

  @Persisted
  // @Properties({ fieldName: 'uuid' })
  public id: string;

  @Persisted
  public blockNumber: number[];

  @Persisted
  public transactionId: string[];

  @Persisted
  @Properties({ fieldName: 'transactionStatus' })
  public status: string[];

  identities: Array<any>;

  @Persisted
  @Properties({ transform: value => JSON.stringify(value) })
  metaData: any;

  @Persisted
  @Properties({ transform: value => JSON.stringify(value) })
  metaDataInternal: any;

  @Persisted
  createdDate: number;

  @Persisted
  createdByPersonId?: string;

  loggedPersonId?: string;

  constructor(
    payload: any,
    blockNumber?: string,
    transactionId?: string,
    status?: string,
  ) {
    Object.assign(this, payload);
    // init arrays
    this.blockNumber = [];
    this.transactionId = [];
    this.status = [];
    // push to arrays
    this.blockNumber.push(Number(blockNumber));
    this.transactionId.push(transactionId);
    this.status.push(status);
  }

  /**
   * static function to get model id
   * @param id model id/uuid
   */
  public static async getEntity<T extends BaseModel>(neo4jService: Neo4jService, modelType: ModelType, id: string) {
    const label: ModelType = getEnumKeyFromEnumValue(ModelType, modelType);
    // compose merge
    const cypher = `MATCH (n:${label} { id: $id }) RETURN n`;
    // Logger.debug(cypher);
    // pass this as parameter object
    const result: void | QueryResult = await neo4jService
      .read(cypher, { id })
      .catch(error => {
        Logger.error(error);
      });
    if (!result) {
      return null;
    }
    // trick to cast to generic type
    return (result.records[0].get('n').properties as T);
  }

  /**
   * get decorator Properties
   * @param payloadPropKeys the update payload object keys to use in set / querySetFields / querySetProperties
   */
  public getProperties(payloadPropKeys: string[] = []): DecoratedProperties {
    const showLog = false;
    const decoratedProperties: DecoratedProperties = {
      queryFields: [],
      queryReturnFields: [],
      querySetFields: [],
      queryRelationProperties: '',
      querySetProperties: '',
    };
    // temp object to save queryRelation objtec with non empty properties
    const relationObject = {};
    const props = Object.entries(this);
    props.forEach(e => {
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
        const fieldName = props && props.fieldName ? props.fieldName : k;
        const returnField =
          props && props.returnField ? props.returnField : null;
        const map: Object[] = props && props.map ? props.map : [];
        const transform: Function =
          props && props.transform ? props.transform : null;
        if (transform) {
          this[k] = transform(this[k]);
        }
        if (showLog)
          Logger.log(
            `k:[${k}], v:[${v}], fieldName:[${fieldName}, Persisted:[${persisted}]]`,
          );
        // if is a mapped field
        if (map.length > 0) {
          map.forEach(p => {
            // if (k === 'participant') {
            //   debugger;
            // }
            const [sourceProp, targetProp] = Object.entries(p)[0];
            if (showLog)
              Logger.debug(
                `${k}.${sourceProp}=[${this[k][sourceProp]}]: mapped to ${targetProp}: $${k}.${sourceProp}`,
              );
            if (this[k]) {
              decoratedProperties.queryFields.push(
                `${targetProp}:$${k}.${sourceProp}`,
              );
              // push if exists in payloadPropKeys array, or payloadPropKeys is empty (add all)
              if (payloadPropKeys.length === 0 || payloadPropKeys.indexOf(fieldName) > -1) {
                decoratedProperties.querySetFields.push(
                  `n.${targetProp}=$${k}.${sourceProp}`,
                );
              }
              // decoratedProperties.queryRelationProperties.push(`${targetProp}: $${k}.${sourceProp}`);
            }
          });
        } else {
          if (this[k]) {
            decoratedProperties.queryFields.push(`${fieldName}: $${k}`);
            // push if exists in payloadPropKeys array, or payloadPropKeys is empty (add all)
            if (payloadPropKeys.length === 0 || payloadPropKeys.indexOf(fieldName) > -1) {
              decoratedProperties.querySetFields.push(`n.${fieldName}=$${k}`);
            }
            // decoratedProperties.queryRelationProperties.push(`${fieldName}: $${k}`);
          }
        }
        if (returnField) {
          decoratedProperties.queryReturnFields.push(
            `n.${fieldName} AS ${fieldName}`,
          );
        }
      }
    });
    // if don't have queryReturnFields RETURN n has default
    if (decoratedProperties.queryReturnFields.length === 0) {
      decoratedProperties.queryReturnFields.push('n');
    }
    // compose queryRelationProperties
    decoratedProperties.queryRelationProperties = decoratedProperties.queryFields.join(',');
    decoratedProperties.querySetProperties = decoratedProperties.querySetFields.join(',');
    // return final object
    return decoratedProperties;
  }

  // TODO: replace <any> with generic type
  async save(neo4jService: Neo4jService): Promise<any> {
    const { queryFields, queryReturnFields } = this.getProperties();
    // compose merge
    const cypher = `
      MERGE 
        (n:${this.constructor.name} { ${queryFields} })
      RETURN 
        ${queryReturnFields}
    `;
    // Logger.debug(cypher);
    // pass this as parameter object
    const result: void | QueryResult = await neo4jService
      .write(cypher, this)
      .catch(error => {
        Logger.error(error);
      });
    if (!result) {
      return {};
    }
    return result.records;
  }

  // TODO: replace <any> with generic type
  async update(neo4jService: Neo4jService, payloadPropKeys: string[]): Promise<any> {
    const { querySetFields, queryReturnFields } = this.getProperties(payloadPropKeys);
    // const queryUpdateSetFields = querySetFields.filter((e) => {
    //   payloadPropKeys.forEach((p) => {
    //     return e.startsWith(`n.${p}`);
    //   });
    // }).join(',');
    // compose merge
    const cypher = `
        MATCH
          (n {id: $id})
        SET 
          ${querySetFields}
        RETURN 
          ${queryReturnFields}
      `;
    // Logger.debug(cypher);
    // pass this as parameter object
    const result: void | QueryResult = await neo4jService
      .write(cypher, this)
      .catch(error => {
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
