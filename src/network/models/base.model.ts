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
import { ModelType, ChaincodeEvent } from '../network.enums';
import { ChaincodeEventActionArguments } from '../network.types';

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

  @Persisted
  @Properties({ fieldName: 'transactionEvent' })
  public event: string[];

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

  constructor({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments) {
    Object.assign(this, payload);
    // init arrays
    this.blockNumber = [];
    this.transactionId = [];
    this.status = [];
    this.event = [];
    // push to arrays
    this.blockNumber.push(Number(blockNumber));
    this.transactionId.push(transactionId);
    this.status.push(status);
    const eventName = (event as any).event_name;
    const eventEnum: ChaincodeEvent = getEnumKeyFromEnumValue(
      ChaincodeEvent,
      eventName,
    );
    this.event.push(eventEnum);
  }

  /**
   * return object without null/empry props
   */
  props() {
    return removeEmpty(this);
  }

  /**
   * static function to get model id
   * @param id model id/uuid
   */
  static async getEntity<T extends BaseModel>(neo4jService: Neo4jService, modelType: ModelType, id: string) {
    const label: ModelType = getEnumKeyFromEnumValue(ModelType, modelType);
    // compose cypher query
    const cypher = `MATCH (n:${label} { id: $id }) RETURN n`;
    // Logger.debug(cypher, BaseModel.name);
    // pass this as parameter object
    const result: void | QueryResult = await neo4jService
      .read(cypher, { id })
      .catch(error => {
        Logger.error(error, BaseModel.name);
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
  getProperties(payloadPropKeys: string[] = []): DecoratedProperties {
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
            BaseModel.name
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
                BaseModel.name
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
    // add transaction props
    // The coalesce goes through the comma seperated list (inside the brackets) from left to right and skips the 
    // variables that are Null values. So in this case if n.* is initially Null the coalesce would take the second parameter which is the empty array.
    decoratedProperties.querySetFields.push('n.blockNumber=coalesce(n.blockNumber,[])+$blockNumber[0]');
    decoratedProperties.querySetFields.push('n.transactionId=coalesce(n.transactionId,[])+$transactionId[0]');
    decoratedProperties.querySetFields.push('n.transactionStatus=coalesce(n.transactionStatus,[])+$status[0]');
    decoratedProperties.querySetFields.push('n.transactionEvent=coalesce(n.transactionEvent,[])+$event[0]');
    // compose queryRelationProperties
    decoratedProperties.queryRelationProperties = decoratedProperties.queryFields.join(',');
    decoratedProperties.querySetProperties = decoratedProperties.querySetFields.join(',');
    // return final object
    return decoratedProperties;
  }

  async save(neo4jService: Neo4jService): Promise<void | QueryResult> {
    // check if transaction is already persisted from other node/peer
    if (await this.checkIfTransactionIsPersisted(neo4jService)) return;
    // proceed with save
    const { queryFields, queryReturnFields } = this.getProperties();
    // compose merge
    const cypher = `
      MERGE 
        (n:${this.constructor.name} { ${queryFields} })
      ON CREATE SET
        n.blockNumber=[],
        n.transactionId=[],
        n.transactionStatus=[],
        n.transactionEvent=[]
      RETURN 
        ${queryReturnFields}
    `;
    // Logger.debug(cypher, BaseModel.name);
    // pass this as parameter object
    const result: void | QueryResult = await neo4jService
      .write(cypher, this)
      .catch(error => {
        Logger.error(error, BaseModel.name);
      });
    return result;
  }

  /**
   * update
   * @param neo4jService 
   * @param payloadPropKeys keys used to compose set fields:values
   * @param label only used with upserts, to add label in merge
   */
  async update(neo4jService: Neo4jService, payloadPropKeys: string[], label: string = ''): Promise<void | QueryResult> {
    // check if transaction is already persisted from other node/peer
    if (await this.checkIfTransactionIsPersisted(neo4jService)) return;
    // proceed with save
    const { querySetFields, queryReturnFields } = this.getProperties(payloadPropKeys);
    label = (label) ? `:${label}` : '';
    // compose cypher query
    const cypher = `
      MERGE
        (n${label} {id: $id})
      SET
        ${querySetFields}
      RETURN 
        ${queryReturnFields}
    `;
    // Logger.debug(cypher, BaseModel.name);
    // pass this as parameter object
    const result: void | QueryResult = await neo4jService
      .write(cypher, this)
      .catch(error => {
        Logger.error(error, BaseModel.name);
      });
    return result;
  }

  /**
   * helper method to check if current transactionId has alreay been persisted by other node/peer
   * @param neo4jService
   */
  async checkIfTransactionIsPersisted(neo4jService: Neo4jService): Promise<boolean> {
    // compose match
    const cypher = `
        MATCH 
          (n:${this.constructor.name})
        WHERE 
          ANY(x IN n.transactionId WHERE x = $transactionId[0])
        RETURN 
          n.transactionId
      `;
    // Logger.debug(cypher, BaseModel.name);
    // pass this as parameter object
    const result: void | QueryResult = await neo4jService
      .read(cypher, this)
      .catch(error => {
        Logger.error(error, BaseModel.name);
      });
    const isPersisted = (result && result.records && result.records.length > 0);
    // log here, this way we dont have this boilerplate in function calls
    if (isPersisted) {
      Logger.log(`skip persist event on graphdb. transaction is already persisted in graphdb by other network node.`, BaseModel.name);
    }
    return isPersisted;
  }
}
