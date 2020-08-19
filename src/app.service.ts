import { Injectable, Logger } from '@nestjs/common';
import { QueryResult } from 'neo4j-driver';
import { Neo4jService } from './neo4j/neo4j.service';
import { MovieDto } from './neo4j/dto/movie.dto';
import { NetworkService } from './network/network.service';

@Injectable()
export class AppService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly networkService: NetworkService,
  ) {}

  getHello(): string {
    return `Hello World! ${this.networkService.getConfig().chaincodeName}`;
  }

  async getTotalNodes(): Promise<string> {
    // console.log(this.neo4jService);
    const result: void | QueryResult = await this.neo4jService
      .read('MATCH (n) RETURN count(n) as count', {})
      .catch(error => {
        Logger.error(error, AppService.name);
      });
    let count = 0;
    const database = this.neo4jService.getConfig().database || 'default';
    if (result) {
      // console.log(result.records);
      count = Number(result.records[0].get('count'));
    }
    return `total nodes in ${database} database: ${count}`;
  }

  async createMovie(movieDto: MovieDto): Promise<any> {
    const cypher = `
      MERGE 
        (m:Movie {
          title: $title, 
          tagline: $tagline,
          released: $released
        })
      RETURN 
        m.title AS title,  
        m.tagline as tagline, 
        m.released as released
    `;
    const result: void | QueryResult = await this.neo4jService
      .write(cypher, movieDto)
      .catch(error => {
        Logger.error(error, AppService.name);
      });
    if (!result) {
      return {};
    }
    return result.records;
  }
}
