import { getEnumKeyFromEnumValue } from '../../main.util';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Persisted, Properties } from '../decorators';
import {
  GraphLabelRelationship,
  ModelType,
  ResourceType,
  TransactionType,
} from '../network.enums';
import { Entity, WriteTransaction } from '../network.types';
import { BaseModel } from './base.model';
import { Good } from './good.model';
import { Participant } from './participant.model';
import { Asset } from './asset.model';

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

  goods?: Array<Good>;

  // don't put in base, else we hav circular dependency problems
  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;

  // overriding super class method
  async save(neo4jService: Neo4jService): Promise<any> {
    // init writeTransaction
    const writeTransaction: WriteTransaction[] = new Array<WriteTransaction>();
    const { queryFields, queryReturnFields } = this.getProperties();
    const inputType: ModelType = getEnumKeyFromEnumValue(
      ModelType,
      this.input.entity.type,
    );
    const outputType: ModelType = getEnumKeyFromEnumValue(
      ModelType,
      this.output.entity.type,
    );
    // stage#1: create transaction node
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
        (a:${inputType} {id: $input.entity.id}),
        (b:${this.constructor.name} {id: $id}),
        (c:${outputType} {id: $output.entity.id})
      CREATE
        (a)-[:${GraphLabelRelationship.CREATE}]->(b)-[:${GraphLabelRelationship.TO_ENTITY}]->(c)
      `;
    writeTransaction.push({ cypher: relationCypher, params: this });

    // stage#3: TransferFunds
    if (
      this.transactionType === TransactionType.TransferFunds &&
      this.resourceType == ResourceType.Funds
    ) {
      const fieldPrefix = 'funds';
      // common query for both fields funds and volunteeringHours
      const cypher = `
        MATCH
          (a:${inputType} {id: $input.entity.id}),
          (b:${outputType} {id: $output.entity.id})
        SET
          a.${fieldPrefix}Debit=(a.${fieldPrefix}Debit+$quantity),
          a.${fieldPrefix}Balance=(a.${fieldPrefix}Balance-$quantity),
          b.${fieldPrefix}Credit=(b.${fieldPrefix}Credit+$quantity),
          b.${fieldPrefix}Balance=(b.${fieldPrefix}Balance+$quantity)
      `.trim();
      writeTransaction.push({ cypher, params: this });
    }
    // stage#4: TransferVolunteeringHours
    if (
      this.transactionType === TransactionType.TransferVolunteeringHours &&
      this.resourceType === ResourceType.VolunteeringHours
    ) {
      const fieldPrefix = 'volunteeringHour';
      const cypher = `
        MATCH
          (a:${inputType} {id: $input.entity.id}),
          (b:${outputType} {id: $output.entity.id})
        SET
          a.${fieldPrefix}Debit=(a.${fieldPrefix}Debit+$quantity),
          a.${fieldPrefix}Balance=(a.${fieldPrefix}Balance-$quantity),
          b.${fieldPrefix}Credit=(b.${fieldPrefix}Credit+$quantity),
          b.${fieldPrefix}Balance=(b.${fieldPrefix}Balance+$quantity)
      `.trim();
      debugger;
      writeTransaction.push({ cypher, params: this });
    }
    // stage#5: create/merge goods: create goods on graph and tripple links it to inputEntity, outputEntity and transaction
    if (
      this.transactionType === TransactionType.TransferGoods &&
      this.resourceType == ResourceType.GenericGoods &&
      this.goods.length > 0
    ) {
      this.goods.forEach(e => {
        const good = new Good(
          e,
          String(this.blockNumber[0]),
          this.transactionId[0],
          this.status[0],
        );
        const { querySetProperties } = good.getProperties();
        // combine params
        const params = {
          ...good,
          // don't use transactionId, else collide with event transactionId
          relationTransactionId: this.id,
          input: { entity: { id: this.input.entity.id } },
          output: { entity: { id: this.output.entity.id } },
        };
        // stage#5.1: merge new good on graphq, with SUM/INCREMENT balance
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
        // stage#5.2: create triple relation inputEntity(decrease), outputEntity(increase) and transaction(increase)
        debugger;
        cypher = `
          MATCH
            (a:${this.constructor.name} {id: $relationTransactionId}),
            (b:${inputType} {id: $input.entity.id}),
            (c:${outputType} {id: $output.entity.id}),
            (d:${good.constructor.name} {barCode: $barCode})
          MERGE  
            (a)-[r1:${GraphLabelRelationship.TRANSFERED_GOOD}]->(d)
            ON CREATE SET
              r1.balanceCredit=0,
              r1.balanceDebit=0,
              r1.balanceBalance=0
            SET
              r1.balanceCredit=(r1.balanceCredit+$balance.credit),
              r1.balanceBalance=(r1.balanceCredit-r1.balanceDebit)
          MERGE
            (b)-[r2:${GraphLabelRelationship.TRANSFERED_GOOD}]->(d)
            ON CREATE SET
              r2.balanceCredit=0,
              r2.balanceDebit=0,
              r2.balanceBalance=0
            SET
              r2.balanceDebit=(r2.balanceDebit+$balance.credit),
              r2.balanceBalance=(r2.balanceCredit-r2.balanceDebit)
          MERGE
            (c)-[r3:${GraphLabelRelationship.TRANSFERED_GOOD}]->(d)
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
    }
    // stage#6: asset transaction
    if (
      this.transactionType === TransactionType.TransferAsset &&
      this.assetId
    ) {
      // delete old owner relation
      let cypher = `
        MATCH
          (a)-[r1:${GraphLabelRelationship.OWNS_ASSET}]->(b:${Asset.name} {id: $assetId})
        DELETE
          r1
      `.trim();
      writeTransaction.push({ cypher, params: this });
      // create tripple relation transaction > asset, inputEntity assets and outputEntity Asset
      cypher = `
        MATCH
          (a:${this.constructor.name} {id: $id}),
          (b:${inputType} {id: $input.entity.id}),
          (c:${outputType} {id: $output.entity.id}),
          (d:${Asset.name} {id: $assetId})
        CREATE
          (a)-[:${GraphLabelRelationship.TRANSFERED_ASSET}]->(d)
        CREATE  
          (b)-[:${GraphLabelRelationship.TRANSFERED_ASSET}]->(d)
        CREATE  
          (c)-[:${GraphLabelRelationship.OWNS_ASSET}]->(d)
      `.trim();
      writeTransaction.push({ cypher, params: this });
    }
    const txResult = await neo4jService.writeTransaction(writeTransaction);
  }
}
