import { Provider, DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { Neo4jModule } from '../neo4j/neo4j.module';
import { UserResolver } from './user.resolver';
import { USER_CONFIG } from './user.constants';
import { UserMokejRepository } from './user.moke.repository';

@Module({})
export class UserModule {
  static forRootAsync(configProvider): DynamicModule {
    return {
      module: UserModule,
      global: true,
      imports: [
        ConfigModule,
        Neo4jModule,
      ],
      providers: [
        UserService,
        UserResolver,
        UserMokejRepository,
        {
          provide: USER_CONFIG,
          ...configProvider,
        } as Provider<any>,
      ],
      exports: [UserService, UserResolver, UserMokejRepository],
    };
  }
}

// old simple module, with moke data
// @Module({
//   providers: [UserService, UserResolver],
//   exports: [UserService, UserResolver],
// })
// export class UserModule { }
