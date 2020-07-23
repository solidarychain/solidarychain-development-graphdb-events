import { getEnumKeyFromEnumValue } from '../../main.util';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Persisted, Properties } from '../decorators';
import { GraphLabelRelationship, ModelType, ResourceType, TransactionType } from '../network.enums';
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
  // without transaction-[]->goods
  // MATCH (a:Person)-[r1:CREATE]->(b:Transaction {uuid: $id})-[r2:TO_ENTITY]->(c:Cause)-[r3:HAS_GOOD]-(d:Good) RETURN a,b,c,d,r1,r2,r3
  // full
  // MATCH (a:Person)-[r1:CREATE]->(b:Transaction {uuid: $id})-[r2:HAS_GOOD]->(c:Good)<-[r3:HAS_GOOD]-(d:Cause), (b)-[r4:TO_ENTITY]->(e) RETURN a,b,c,d,e,r1,r2,r3,r4
  async save(neo4jService: Neo4jService): Promise<any> {
    // init writeTransaction
    const writeTransaction: WriteTransaction[] = new Array<WriteTransaction>();
    const { queryFields, queryReturnFields } = this.getProperties();
    // stage#1: create transaction
    const inputType: ModelType = getEnumKeyFromEnumValue(ModelType, this.input.entity.type);
    const outputType: ModelType = getEnumKeyFromEnumValue(ModelType, this.output.entity.type);
    const transactionCypher = `
      MERGE 
        (n:${this.constructor.name} {
          ${queryFields}
        })
      RETURN 
      ${queryReturnFields}
    `;
    writeTransaction.push({ cypher: transactionCypher, params: this });
    // stage#2: create relation (:Entity)-[:CREATE]->(:Transaction)-[:TO_ENTITY]->(:Entity)
    const relationCypher = `
      MATCH 
        (a:${inputType} {uuid: $input.entity.id}),
        (b:${this.constructor.name} {uuid: $id}),
        (c:${outputType} {uuid: $output.entity.id})
      CREATE
        (a)-[:${GraphLabelRelationship.CREATE}]->(b)-[:${GraphLabelRelationship.TO_ENTITY}]->(c)
      `;
    writeTransaction.push({ cypher: relationCypher, params: this });
    // stage#3: create goods
    // merge goods
    if (this.goods.length > 0) {
      this.goods.forEach((e) => {
        const good = new Good(e, String(this.blockNumber), this.transactionId, this.status);
        const { querySetProperties } = good.getProperties();
        // combine params
        const params = {
          ...good,
          // don't use transactionId, else collide with event transactionId
          relationTransactionId: this.id,
          input: { entity: { id: this.input.entity.id } },
          output: { entity: { id: this.output.entity.id } },
        };
        // merge new good on graphq, with SUM/INCREMENT balance
        let cypher = `
          MERGE 
            (n:${good.constructor.name} {barCode: $barCode})
          ON CREATE SET
            n:${good.constructor.name},
            ${querySetProperties},
            n.balanceCredit=0,
            n.balanceDebit=0,
            n.balanceBalance=0
          SET 
            n.balanceCredit=(n.balanceCredit+$balance.credit),
            n.balanceDebit=(n.balanceDebit+$balance.debit),
            n.balanceBalance=(n.balanceCredit-n.balanceDebit)
        `;
        writeTransaction.push({ cypher, params });

        // 2. merge good transaction to good relation (onRelation)

        // 3. merge entity to good relation SUMMING quantities (onRelation)

        // merge goods and create transaction and output entity relations to goods
        cypher = `
          MATCH
            (a:${this.constructor.name} {uuid: $relationTransactionId}),
            (b:${inputType} {uuid: $input.entity.id}),
            (c:${outputType} {uuid: $output.entity.id}),
            (d:${good.constructor.name} {barCode: $barCode})
          MERGE  
            (a)-[r1:${GraphLabelRelationship.HAS_GOOD}]->(d)
            ON CREATE SET
              r1.balanceCredit=0,
              r1.balanceDebit=0,
              r1.balanceBalance=0
            SET
              r1.balanceCredit=(r1.balanceCredit+$balance.credit),
              r1.balanceBalance=(r1.balanceCredit-r1.balanceDebit)
          MERGE
            (b)-[r2:${GraphLabelRelationship.HAS_GOOD}]->(d)
            ON CREATE SET
              r2.balanceCredit=0,
              r2.balanceDebit=0,
              r2.balanceBalance=0
            SET
              r2.balanceDebit=(r2.balanceDebit+$balance.credit),
              r2.balanceBalance=(r2.balanceCredit-r2.balanceDebit)
          MERGE
            (c)-[r3:${GraphLabelRelationship.HAS_GOOD}]->(d)
            ON CREATE SET
              r3.balanceCredit=0,
              r3.balanceDebit=0,
              r3.balanceBalance=0
            SET
              r3.balanceCredit=(r3.balanceCredit+$balance.credit),
              r3.balanceBalance=(r3.balanceCredit-r3.balanceDebit)
        `.trim();
        writeTransaction.push({ cypher, params });
      });

      // TODO sum quantities in output entity

      // TODO when create good on graph, dont persist quantities, or sum ir like and average of amount transfered, better

      // TODO: goods relation

      // TODO: asset relation
    }
    const txResult = await neo4jService.writeTransaction(writeTransaction);
  }
}
