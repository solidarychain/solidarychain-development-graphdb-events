import { HttpException, Inject, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserStore } from './user.store';
import { appConstants as c } from '../common/constants';
import { User } from './models';
import { UserData, UserRoles } from './types';
import { userData } from './user.data';
import { PaginationArgs } from '../common/dto';
import { NewUserInput } from './dto/new-user.input';
import { Neo4jService } from '../neo4j/neo4j.service';
import { USER_CONFIG } from './user.constants';
import { UserConfig } from 'fabric-client';
import { newUuid } from '../common';
import { hashPassword } from '../auth/auth.utils';
import { UserRepository } from './interfaces';

@Injectable()
export class UserService implements UserRepository{
  // init usersStore
  usersStore: UserStore = new UserStore();

  constructor(
    // require to use @Inject(USER_CONFIG)
    @Inject(USER_CONFIG) private readonly config: UserConfig,
    // here @Inject(Class) is optional
    private readonly neo4jService: Neo4jService,
  ) { 
    debugger;
    console.log('debug');
  }

  async findAll(paginationArgs: PaginationArgs): Promise<User[]> {
    // clone array before slice it
    const data = userData.slice();
    return (paginationArgs)
      ? data.splice(paginationArgs.skip, paginationArgs.take)
      : data;
  }

  async findOneByField(field: string, value: string): Promise<User> {
    return userData.find((e: UserData) => e[field] === value);
  }

  async create(data: NewUserInput): Promise<User> {
    const password = hashPassword(data.password);
    const user = {
      ...data,
      id: data.id || newUuid(),
      password,
      roles: [UserRoles.User],
      // add date in epoch unix time
      createdDate: new Date().getTime(),
    };
    userData.push(user);
    return user;
  }

  async findOneByUsername(username: string): Promise<User> {
    try {
      return userData.find((e: UserData) => e.username === username);
    } catch (error) {
      Logger.error(JSON.stringify(error));
      const errorMessage: string = (error.responses[0]) ? error.responses[0].error.message : c.API_RESPONSE_INTERNAL_SERVER_ERROR;
      // throw new HttpException({ status: HttpStatus.CONFLICT, error: errorMessage }, HttpStatus.NOT_FOUND);
      // don't show original error message, override it with a forbidden message equal to the one when fails password, more secure, this way we hide if username exists or not form hacking
      throw new HttpException({ status: HttpStatus.FORBIDDEN, error: 'Forbidden', message: `Forbidden resource` }, HttpStatus.FORBIDDEN);
    }
  }
}
