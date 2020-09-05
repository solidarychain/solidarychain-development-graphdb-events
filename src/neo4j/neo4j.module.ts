import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Driver } from 'neo4j-driver';
import { Neo4jConfig } from './interfaces';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';
import { Neo4jService } from './neo4j.service';
import { createDriver } from './neo4j.util';

@Module({})
export class Neo4jModule {
  static forRoot(config: Neo4jConfig): DynamicModule {
    return {
      module: Neo4jModule,
      providers: [
        Neo4jService,
        // new Neo4jConfig onTheFly provider
        {
          provide: NEO4J_CONFIG,
          // instance of a provider to be injected.
          useValue: config,
        },
        // new Neo4jDriver onTheFly provider
        {
          provide: NEO4J_DRIVER,
          // context
          inject: [NEO4J_CONFIG],
          useFactory: async (config: Neo4jConfig): Promise<Driver> => {
            return createDriver(config);
          },
        },
      ],
      exports: [Neo4jService],
    };
  }

  static forRootAsync(configProvider): DynamicModule {
    return {
      module: Neo4jModule,
      global: true,
      imports: [ConfigModule],
      providers: [
        {
          provide: NEO4J_CONFIG,
          ...configProvider,
        } as Provider<any>,
        {
          provide: NEO4J_DRIVER,
          inject: [NEO4J_CONFIG],
          useFactory: async (config: Neo4jConfig): Promise<Driver> => {
            return createDriver(config);
          },
        },
        Neo4jService,
      ],
      exports: [Neo4jService],
    };
  }
}
