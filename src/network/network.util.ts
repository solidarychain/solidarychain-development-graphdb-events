import { NetworkConnection } from './network-connection';
import { Neo4jService } from '../neo4j/neo4j.service';
import { NetworkConfig } from './interfaces';

export const createNetworkConnection = async (
  config: NetworkConfig,
  neo4jService: Neo4jService,
): Promise<NetworkConnection> => {
  return new NetworkConnection(config, neo4jService);
};
