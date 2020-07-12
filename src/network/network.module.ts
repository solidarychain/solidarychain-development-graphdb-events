import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { NetworkConfig } from './network-config.interface';
import { NetworkConnection } from './network-connection';
import { NETWORK_CONFIG, NETWORK_CONNECTION } from './network.constants';
import { NetworkService } from './network.service';
import { createNetworkConnection } from './network.util';

@Module({
  providers: [NetworkService]
})

export class NetworkModule {
  static forRootAsync(configProvider): DynamicModule {
    return {
      module: NetworkModule,
      global: true,
      imports: [ConfigModule, Neo4jModule],
      providers: [
        NetworkService,
        {
          provide: NETWORK_CONFIG,
          ...configProvider
        } as Provider<any>,
        {
          provide: NETWORK_CONNECTION,
          inject: [NETWORK_CONFIG, Neo4jService],
          useFactory: async (config: NetworkConfig, neo4jService: Neo4jService): Promise<NetworkConnection> => {
            return createNetworkConnection(config, neo4jService);
          },
        },
      ],
      exports: [
        NetworkService,
      ]
    }
  }
}
