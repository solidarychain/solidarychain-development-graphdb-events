import { NetworkConfig } from "./network-config.interface";
import { NetworkConnection } from "./network-connection";
import { Neo4jService } from "../neo4j/neo4j.service";

export const createNetworkConnection = async (config: NetworkConfig, neo4jService: Neo4jService): Promise<NetworkConnection> => {
  return new NetworkConnection(config, neo4jService);
};
