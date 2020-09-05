import { UserRepository } from './interfaces';
import { User } from './models';

export class UserNeo4jRepository implements UserRepository {
  findAll(paginationArgs: import("../common/dto").PaginationArgs): Promise<User[]> {
    throw new Error("Method not implemented.");
  }
  findOneByField(field: string, value: string): Promise<User> {
    throw new Error("Method not implemented.");
  }
  create(data: import("./dto").NewUserInput): Promise<User> {
    throw new Error("Method not implemented.");
  }
  findOneByUsername(username: string): Promise<User> {
    throw new Error("Method not implemented.");
  }
}