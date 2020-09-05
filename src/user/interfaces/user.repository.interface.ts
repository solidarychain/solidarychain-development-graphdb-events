import { PaginationArgs } from "../../common/dto";
import { NewUserInput } from "../dto";
import { User } from "../models";

export interface UserRepository {
  findAll(paginationArgs: PaginationArgs): Promise<User[]>;
  findOneByField(field: string, value: string): Promise<User>;
  findOneByUsername(username: string): Promise<User>
  create(data: NewUserInput): Promise<User>;
}
