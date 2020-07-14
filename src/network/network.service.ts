import { Injectable, Inject, OnApplicationShutdown, Logger } from '@nestjs/common';
import { NetworkConfig } from './network-config.interface';
import { NETWORK_CONFIG, NETWORK_CONNECTION } from './network.constants';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { NetworkConnection } from './network-connection';

@Injectable()
export class NetworkService implements OnApplicationShutdown  {
  constructor(
    @Inject(NETWORK_CONFIG) private readonly config: NetworkConfig,
    @Inject(NETWORK_CONNECTION) private readonly connection: NetworkConnection,
    @Inject(Neo4jService) private readonly neo4jService: Neo4jService
  ) { 
    // bellow is working
    // Logger.debug(this.connection.getPeerIdentity());
    // Logger.debug(this.neo4jService.getConfig().scheme);
  }

  onApplicationShutdown(signal?: string) {
    Logger.log(`cleanup application Shutdown`);
    // Disconnect from the gateway.
    this.connection.disconnectGateway();
  }

  getConfig(): NetworkConfig {
    return this.config;
  };
}