import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { UserConfig } from 'fabric-client';
import { appConstants as c } from '../common/constants';
import { PaginationArgs } from '../common/dto';
import { NewUserInput } from './dto/new-user.input';
import { UserRepository } from './interfaces';
import { User } from './models';
import { USER_CONFIG } from './user.constants';
import { UserNeo4jRepository } from './user.neo4j.repository';
import { UserStore } from './user.store';

@Injectable()
export class UserService implements UserRepository {
  // init usersStore
  usersStore: UserStore = new UserStore();

  constructor(
    // require to use @Inject(USER_CONFIG)
    @Inject(USER_CONFIG) private readonly config: UserConfig,
    // here @Inject(Class) is optional
    private readonly userRepository: UserNeo4jRepository,
  ) { }

  async findAll(paginationArgs: PaginationArgs): Promise<User[]> {
    try {
      return this.userRepository.findAll(paginationArgs);
    } catch (error) {
      Logger.error(JSON.stringify(error));
      const errorMessage: string = (error.responses[0]) ? error.responses[0].error.message : c.API_RESPONSE_INTERNAL_SERVER_ERROR;
      throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Forbidden', message: errorMessage }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneByField(field: string, value: string): Promise<User> {
    try {
      return this.userRepository.findOneByField(field, value);
    } catch (error) {
      Logger.error(JSON.stringify(error));
      const errorMessage: string = (error.responses[0]) ? error.responses[0].error.message : c.API_RESPONSE_INTERNAL_SERVER_ERROR;
      throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Forbidden', message: errorMessage }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneByUsername(username: string): Promise<User> {
    try {
      return this.userRepository.findOneByUsername(username);
    } catch (error) {
      Logger.error(JSON.stringify(error));
      const errorMessage: string = (error.responses[0]) ? error.responses[0].error.message : c.API_RESPONSE_INTERNAL_SERVER_ERROR;
      throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Forbidden', message: errorMessage }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(data: NewUserInput): Promise<User> {
    try {
      return this.userRepository.create(data);
    } catch (error) {
      Logger.error(JSON.stringify(error));
      const errorMessage: string = (error.responses[0]) ? error.responses[0].error.message : c.API_RESPONSE_INTERNAL_SERVER_ERROR;
      throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Forbidden', message: errorMessage }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
