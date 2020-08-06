import { Module, DynamicModule, Provider, Logger } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { Neo4jConfig } from './neo4j-config.interface';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';
import { createDriver } from './neo4j.util';
import { Driver } from 'neo4j-driver';
import { ConfigModule } from '@nestjs/config';

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
