import { Logger } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { Neo4jConfig } from './interfaces';

export const createDriver = async (config: Neo4jConfig): Promise<Driver> => {
  const uri = `${config.scheme}://${config.host}:${config.port}`;
  // don't use Neo4jModule.name here to prevent circular dependencies
  Logger.log(`neo4j createDriver uri: ${uri}`, 'Neo4jModule');
  const driver: Driver = neo4j.driver(
    uri,
    neo4j.auth.basic(config.username, config.password),
    config.options,
  );

  await driver.verifyConnectivity();

  return driver;
};
