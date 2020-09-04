import { Injectable, Inject, Logger } from '@nestjs/common';
import { Neo4jConfig } from './neo4j-config.interface';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';
import neo4j, { Driver, Session, Result, QueryResult } from 'neo4j-driver';
import { WriteTransaction } from '../network/network.types';

@Injectable()
export class Neo4jService {
  constructor(
    // require to use @Inject(AUTH_CONFIG)
    @Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig,
    @Inject(NEO4J_DRIVER) private readonly driver: Driver,
  ) { }

  getConfig(): Neo4jConfig {
    return this.config;
  }

  getDriver(): Driver {
    return this.driver;
  }

  getReadSession(database?: string): Session {
    return this.driver.session({
      database: database || this.config.database,
      defaultAccessMode: neo4j.session.READ,
    });
  }

  getWriteSession(database?: string): Session {
    return this.driver.session({
      database: database || this.config.database,
      defaultAccessMode: neo4j.session.WRITE,
    });
  }

  read(cypher: string, params: Record<string, any>, database?: string): Result {
    const session: Session = this.getReadSession(database);
    return session.run(cypher, params);
  }

  write(
    cypher: string,
    params: Record<string, any>,
    database?: string,
  ): Result {
    const session: Session = this.getWriteSession(database);
    return session.run(cypher, params);
  }

  async writeTransaction(
    writeTransaction: WriteTransaction[],
    database?: string,
  ): Promise<QueryResult[]> {
    const session: Session = this.getWriteSession(database);
    const tx = session.beginTransaction();
    const results: QueryResult[] = new Array<QueryResult>();
    try {
      // loop cypher array
      writeTransaction.forEach(async e => {
        const result: QueryResult = await tx
          .run(e.cypher, e.params)
          .catch(error => {
            throw error;
          });
        results.push(result);
      });
      // commit transaction
      await tx.commit();
      Logger.log(`transaction committed`, Neo4jService.name);
    } catch (error) {
      Logger.error(error, Neo4jService.name);
      await tx.rollback();
      Logger.log('transaction rolled back', Neo4jService.name);
    } finally {
      await session.close();
      // stats
      results.forEach((r, idx) => {
        if (r.summary) {
          const stats = { ...(r.summary as any).updateStatistics._stats };
          const keys = Object.keys(stats);
          const props: string[] = [];
          // cleanUp empty properties
          keys.forEach((e) => {
            if (stats[e] === 0) {
              delete stats[e];
            } else {
              props.push(`${e}=${stats[e]}`);
            }
          });
          // only if have props, normally in first query
          if (props.length > 0) {
            Logger.log(`writeTransaction updateStatistics query[${idx}]: ${props.join(', ')}`, Neo4jService.name);
          }
        }
      });
      return results;
    }
  }
}
