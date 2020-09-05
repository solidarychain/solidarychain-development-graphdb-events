import { Injectable, Logger } from '@nestjs/common';
import { QueryResult } from 'neo4j-driver';
import { PaginationArgs } from '../common/dto';
import { Neo4jService } from '../neo4j/neo4j.service';
import { NETWORK_MODEL_PERSON } from '../network/network.constants';
import { NewUserInput } from './dto';
import { UserRepository } from './interfaces';
import { User } from './models';
import { mapToObjectAndKeepProperties } from '../common';

@Injectable()
export class UserNeo4jRepository implements UserRepository {
  constructor(
    private readonly neo4jService: Neo4jService,
  ) { }

  async findAll(paginationArgs: PaginationArgs): Promise<User[]> {
    throw new Error("Method not implemented.");
  }

  async findOneByField(field: string, value: string): Promise<User> {
    const CYPHER_FIND_ONE_BY_FIELD = `MATCH (n:${NETWORK_MODEL_PERSON} { ${field}: $${field} }) RETURN n`;
    const result: void | QueryResult = await this.neo4jService
      .read(CYPHER_FIND_ONE_BY_FIELD, { [field]: value })
      .catch(error => {
        Logger.error(error, UserNeo4jRepository.name);
      });
    if (!result) {
      return null;
    }
    // map person to userv model
    // TODO remove hardcode firstName and lastName
    let newUser = User.new();
    newUser = {
      ...newUser,
      firstName: 'moked',
      lastName: 'moked',
    }
    return mapToObjectAndKeepProperties(result.records[0].get('n').properties, newUser);
  }

  async findOneByUsername(username: string): Promise<User> {
    return this.findOneByField('username', username);
  }

  async create(data: NewUserInput): Promise<User> {
    throw new Error("Method not implemented.");
  }
}