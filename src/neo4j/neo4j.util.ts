import { Logger } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { Neo4jConfig } from './neo4j-config.interface';

export const createDriver = async (config: Neo4jConfig): Promise<Driver> => {
  const uri = `${config.scheme}://${config.host}:${config.port}`;
  Logger.log(`neo4j createDriver uri: ${uri}`);
  const driver: Driver = neo4j.driver(
    uri,
    neo4j.auth.basic(config.username, config.password),
  );

  await driver.verifyConnectivity();

  return driver;
};
