import { getEnumKeyFromEnumValue } from '../../main.util';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Persisted, Properties } from '../decorators';
import { GraphLabel, ModelType, ResourceType, TransactionType } from '../network.enums';
import { Entity, WriteTransaction } from '../network.types';
import { BaseModel } from './base.model';
import { Good } from './good.model';
import { Participant } from './participant.model';

export class Transaction extends BaseModel {
  @Persisted
  transactionType: TransactionType;

  @Persisted
  resourceType: ResourceType;

  input: Entity;

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
  assetId: string;

  // TODO
  goods?: Array<Good>;

  // don't put in base, else we hav circular dependency problems
  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;

  // overriding super class method
  async save(neo4jService: Neo4jService): Promise<any> {
    // init writeTransaction
    const writeTransaction: WriteTransaction[] = new Array<WriteTransaction>();
    const inputType: ModelType = getEnumKeyFromEnumValue(ModelType, this.input.entity.type);
    const outputType: ModelType = getEnumKeyFromEnumValue(ModelType, this.output.entity.type);
    const { queryRelationProperties } = this.getProperties();
    const relation = `
      MATCH 
        (a:${inputType} {uuid: $input.entity.id}),
        (b:${outputType} {uuid: $output.entity.id})
      CREATE
        (a)-[r:${GraphLabel.TRANSACTED_TO} {${queryRelationProperties}}]->(b)
      RETURN
        a,b,r
      `;
    writeTransaction.push({ cypher: relation, params: this });
    // goods
    if (this.goods.length > 0) {
      this.goods.forEach((e) => {
        const good = new Good(e, String(this.blockNumber), this.transactionId, this.status);
        const { queryFields } = good.getProperties();
        const cypher = `
          MERGE 
            (n:${good.constructor.name} {
              ${queryFields}
            })
        `;
        writeTransaction.push({ cypher, params: good });
      });
    }
    debugger;
    const txResult = await neo4jService.writeTransaction(writeTransaction);
  }
}
