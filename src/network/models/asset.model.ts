import { getEnumKeyFromEnumValue } from '../../common';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Persisted, Properties } from '../decorators';
import { AssetType, Entity, GraphLabelRelationship, ModelType, WriteTransaction } from '../types';
import { BaseModel } from './base.model';
import { Participant } from './participant.model';

export class Asset extends BaseModel {
  @Persisted
  @Properties({ returnField: true })
  name: string;

  @Persisted
  description: string;

  @Persisted
  assetType: AssetType;

  @Persisted
  ambassadors: string[];

  @Persisted
  location: string;

  @Persisted
  tags: string[];

  @Persisted
  @Properties({
    map: [
      { 'entity.id': 'inputEntityId' },
      { 'entity.type': 'inputEntityType' },
    ],
  })
  owner: Entity;

  // don't put in base, else we have circular dependency problems `class Asset extends index_1.BaseModel `
  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;

  // static async getEntity(neo4jService: Neo4jService, id: string): Promise<Record[]> {
  //   const record = await super.getEntity<Asset>(neo4jService, ModelType.Asset, id);
  //   Logger.error(record, Asset.name);
  // }

  // overriding super class method
  async save(neo4jService: Neo4jService): Promise<any> {
    // check if transaction is already persisted from other node/peer
    if (await this.checkIfTransactionIsPersisted(neo4jService)) return;
    // init writeTransaction
    const writeTransaction: WriteTransaction[] = new Array<WriteTransaction>();
    const { queryFields, queryReturnFields } = this.getProperties();
    const ownerType: ModelType = getEnumKeyFromEnumValue(
      ModelType,
      this.owner.entity.type,
    );
    // stage#1: create asset and relation to owner
    const cypher = `
      MATCH
        (a:${ownerType} {id: $owner.entity.id})
      MERGE 
        (b:${this.constructor.name} {
          ${queryFields}
        })<-[:${GraphLabelRelationship.OWNS_ASSET}]-(a)
    `;
    writeTransaction.push({ cypher, params: this });
    this.linkToGenesis(writeTransaction);
    const txResult = await neo4jService.writeTransaction(writeTransaction);
  }
}
