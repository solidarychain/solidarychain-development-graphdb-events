import { getEnumKeyFromEnumValue, removeEmpty } from '../../main.util';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Persisted, Properties } from '../decorators';
import { GraphLabel, ModelType, ResourceType, TransactionType } from '../network.enums';
import { Entity, WriteTransaction } from '../network.types';
import { BaseModel } from './base.model';
import { Goods } from './goods.model';
import { Participant } from './participant.model';

export class Transaction extends BaseModel {
  @Persisted
  transactionType: TransactionType;

  @Persisted
  resourceType: ResourceType;

  @Persisted
  @Properties({ map: [{ 'entity.id': 'inputEntityId' }, { 'entity.type': 'inputEntityType' }] })
  input: Entity;

  @Persisted
  @Properties({ map: [{ 'entity.id': 'outputEntityId' }, { 'entity.type': 'outputEntityType' }] })
  output: Entity;

  @Persisted
  quantity: number;

  @Persisted
  currency: string;

  @Persisted
  location: string;

  @Persisted
  tags: string[];

  @Persisted
  metaData: any;

  @Persisted
  metaDataInternal: any;

  @Persisted
  createdDate: number;

  @Persisted
  createdByPersonId?: string;

  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;

  @Persisted
  assetId: string;

  // TODO
  goods?: Array<Goods>;

  relationProperties: any;

  // overriding super class method
  async save(neo4jService: Neo4jService): Promise<any> {
    // init writeTransaction
    const writeTransaction: WriteTransaction[] = new Array<WriteTransaction>();
    // push model
    //    writeTransaction.push({ cypher: this.getSaveCypher(), params: this });
    // compose relation
    const inputType: ModelType = getEnumKeyFromEnumValue(ModelType, this.input.entity.type);
    const outputType: ModelType = getEnumKeyFromEnumValue(ModelType, this.output.entity.type);
    // const relation = `
    //   MATCH 
    //     (a:${ModelTypeKey.Transaction} {id: $id}),
    //     (b:${inputType} {id: $input.entity.id}),
    //     (c:${outputType} {id: $output.entity.id})
    //   MERGE 
    //     (b)-[:ENTITY_TO_TRANSACTION]->(a)-[:TRANSACTION_TO_ENTITY]->(c)
    //   `;
    const props = this.getProps();
    this.relationProperties = props.obj;
    const relation = `
      MATCH 
        (a:${inputType} {id: $input.entity.id}),
        (b:${outputType} {id: $output.entity.id})
      CREATE
        (a)-[:${GraphLabel.TRANSACTED_TO} {${props.props}}]->(b)
      `;
    // {id: $relationProperties.id, quantity: $relationProperties.quantity}
    writeTransaction.push({ cypher: relation, params: this });
    const txResult = await neo4jService.writeTransaction(writeTransaction);
  }

  /**
   * return flatObject, with only usefull properties to persist on graph relation
   */
  getProps() {
    // TODO use decorator properties for flat stuff, like flat prop.prop.prop to propPropProp
    // create flatten object routine recursively
    const obj = removeEmpty({
      uuid: this.id,
      blockNumber: this.blockNumber,
      transactionId: this.transactionId,
      status: this.status,
      transactionType: this.transactionType,
      resourceType: this.resourceType,
      quantity: this.quantity,
      currency: this.currency,
      location: this.location,
      tags: this.tags,
      metaData: this.metaData,
      metaDataInternal: this.metaDataInternal,
      participantId: this.participant.id,
      createdDate: this.createdDate,
      createdByPersonId: this.createdByPersonId,
      assetId: this.assetId,
      goods: this.goods,
    });
    // todo move to base
    const result: string[] = [];
    Object.entries(obj).forEach((e) => {
      if (e[1]) {
        result.push(`${e[0]}: $relationProperties.${e[0]}`);
      }
    });
    return {obj, props: result.join(',')};
  }
}
