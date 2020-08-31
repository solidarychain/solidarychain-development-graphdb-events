import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Neo4jModule } from './neo4j/neo4j.module';
import { NetworkModule } from './network/network.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    Neo4jModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        scheme: configService.get('NEO4J_SCHEME'),
        host: configService.get('NEO4J_HOST'),
        port: configService.get('NEO4J_PORT'),
        username: configService.get('NEO4J_USERNAME'),
        password: configService.get('NEO4J_PASSWORD'),
        database: configService.get('NEO4J_DATABASE'),
        options: {
          maxConnectionPoolSize: configService.get('NEO4J_CONFIG_LOGGING_MAX_CONNECTION_POOL_SIZE'),
          maxConnectionLifetime: configService.get('NEO4J_CONFIG_LOGGING_MAX_CONNECTION_LIFETIME'),
          logging: {
            level: configService.get('NEO4J_CONFIG_LOGGING_LEVEL'),
            logger: (level, message) => Logger.log(`${level}:${message}`, Neo4jModule.name),
          }
        }
      }),
    }),
    NetworkModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionFile: configService.get('NETWORK_CONNECTION_FILE'),
        walletPath: configService.get('NETWORK_WALLET_PATH') || 'network/wallets',
        chaincodeName: configService.get('NETWORK_CHAINCODE_NAME'),
        channelName: configService.get('NETWORK_CHANNEL_NAME'),
        appAdmin: configService.get('NETWORK_APP_ADMIN'),
        appAdminSecret: configService.get('NETWORK_APP_ADMIN_SECRET'),
        orgMSPID: configService.get('NETWORK_ORG_MSPID'),
        caName: configService.get('NETWORK_CA_NAME'),
        peer: configService.get('NETWORK_PEER'),
        orderer: configService.get('NETWORK_ORDERER'),
        peerIdentity: configService.get('NETWORK_PEER_IDENTITY'),
        gatewayDiscovery: {
          enabled: Boolean(
            configService.get('NETWORK_GATEWAY_DISCOVERY_ENABLED') === 'true' ? true : false,
          ),
          asLocalhost: Boolean(
            configService.get('NETWORK_GATEWAY_DISCOVERY_AS_LOCALHOST') === 'true' ? true : false,
          ),
        },
        nodePriority: Number(configService.get('NETWORK_NODE_PRIORITY')) || 0,
        nodePriorityTimeout: Number(configService.get('NETWORK_NODE_PRIORITY_TIMEOUT')) || 250,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
