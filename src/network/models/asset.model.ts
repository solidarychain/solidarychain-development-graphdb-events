import { Persisted, Properties } from "../decorators";
import { AssetType, ModelType, GraphLabelRelationship } from "../network.enums";
import { Entity, WriteTransaction } from "../network.types";
import { BaseModel } from "./base.model";
import { Participant } from "./participant.model";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { getEnumKeyFromEnumValue } from "src/main.util";

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
  @Properties({ map: [{ 'entity.id': 'inputEntityId' }, { 'entity.type': 'inputEntityType' }] })
  owner: Entity;

  // don't put in base, else we hav circular dependency problems
  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;

  // overriding super class method
  async save(neo4jService: Neo4jService): Promise<any> {
    // init writeTransaction
    const writeTransaction: WriteTransaction[] = new Array<WriteTransaction>();
    const { queryFields, queryReturnFields } = this.getProperties();
    const ownerType: ModelType = getEnumKeyFromEnumValue(ModelType, this.owner.entity.type);
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
    const txResult = await neo4jService.writeTransaction(writeTransaction);
  }
}
