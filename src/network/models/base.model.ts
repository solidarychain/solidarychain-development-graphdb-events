import { Logger } from '@nestjs/common';
import * as Client from 'fabric-client';
import { QueryResult } from 'neo4j-driver/types';
import 'reflect-metadata';
import { getEnumKeyFromEnumValue, removeEmpty } from '../../common';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { getProperties, Persisted, PersistedUsingInstance, Properties } from '../decorators';
import { ChaincodeEvent, ChaincodeEventActionArguments, DecoratedProperties, ModelType, WriteTransaction } from '../types';
// better to use strings here to prevent circular dependencies!
// import { LINK_TO_GENESIS_MODELS, NODE_ID_GENESIS_BLOCK } from '../network.constants';
const LINK_TO_GENESIS_MODELS = ['Asset', 'Cause', 'Participant', 'Person'];
const NODE_ID_GENESIS_BLOCK = '00000000-0000-0000-0000-000000000000';

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

  eventObject: Client.ChaincodeEvent | Client.ChaincodeEvent[];

  constructor({ payload, blockNumber, transactionId, status, event }: ChaincodeEventActionArguments) {
    Object.assign(this, payload);
    // init arrays, require for future updates, to keep history of all transactions, blocks etc, every update push one  more item to array
    this.blockNumber = [];
    this.transactionId = [];
    this.status = [];
    this.event = [];
    this.eventObject = [];
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
    // push original eventObject, used we need to pass it to othet models like in transaction goods
    this.eventObject.push(((event as any).length > 0) ? event[0] : event);
  }

  /**
   * return object without null/empty props
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

    // skip push below fields to skipPushQuerySetFields
    const skipPushQuerySetFields = ['blockNumber', 'transactionId', 'status', 'event'];
    // temp object to save queryRelation object with non empty properties
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
            // skip transaction fields on queryFields (insert)
            if (!skipPushQuerySetFields.includes(k)) {
              // push if exists in payloadPropKeys array, or payloadPropKeys is empty (add all)
              if (payloadPropKeys.length === 0 || payloadPropKeys.indexOf(fieldName) > -1) {
                decoratedProperties.querySetFields.push(`n.${fieldName}=$${k}`);
              }
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
    // The coalesce goes through the comma separated list (inside the brackets) from left to right and skips the 
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
    // init writeTransaction
    const writeTransaction: WriteTransaction[] = new Array<WriteTransaction>();
    const { queryFields, queryReturnFields } = this.getProperties();
    // compose merge
    const cypher = `
      MERGE 
        (n:${this.constructor.name} { ${queryFields} })
      RETURN 
        ${queryReturnFields}
    `;
    writeTransaction.push({ cypher, params: this });
    this.linkToGenesis(writeTransaction);
    const txResult = await neo4jService.writeTransaction(writeTransaction);
    // TODO: deprecated old write without transactions
    // // Logger.debug(cypher, BaseModel.name);
    // // pass this as parameter object
    // const result: void | QueryResult = await neo4jService
    //   .write(cypher, this)
    //   .catch(error => {
    //     Logger.error(error, BaseModel.name);
    //   });
    // return result;
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
    // init writeTransaction
    const writeTransaction: WriteTransaction[] = new Array<WriteTransaction>();
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
    writeTransaction.push({ cypher, params: this });
    const txResult = await neo4jService.writeTransaction(writeTransaction);
    // TODO: deprecated old write without transactions
    // // Logger.debug(cypher, BaseModel.name);
    // // pass this as parameter object
    // const result: void | QueryResult = await neo4jService
    //   .write(cypher, this)
    //   .catch(error => {
    //     Logger.error(error, BaseModel.name);
    //   });
    // return result;
  }

  /**
   * helper method to check if current transactionId has already been persisted by other node/peer
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

  async linkToGenesis(writeTransaction: WriteTransaction[]): Promise<void> {
    if (LINK_TO_GENESIS_MODELS.includes(this.constructor.name)) {
      const cypher = `
        MATCH 
          (g {id: $genesisBlockId}),
          (n:${this.constructor.name} {id:$id})
        MERGE
          (n)-[r:CONNECTED]->(g)
      `;
      writeTransaction.push({ cypher, params: { id: this.id, genesisBlockId: NODE_ID_GENESIS_BLOCK } });
    }
  }
}
