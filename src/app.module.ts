import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthenticationError } from 'apollo-server-core';
import { ConnectionParams } from 'subscriptions-transport-ws';
import { envVariables as e, mapKeysToLowerCase } from './common';
import { GqlContext, GqlContextPayload } from './common/types';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { NetworkModule } from './network/network.module';

@Module({
  imports: [
    // config module
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync({
      // import AuthModule
      imports: [AuthModule],
      // inject authService
      useFactory: async (authService: AuthService) => ({
        debug: true,
        playground: true,
        installSubscriptionHandlers: true,
        autoSchemaFile: 'schema.gql',
        // pass the original req and res object into the graphql context,
        // get context with decorator `@Context() { req, res, payload, connection }: GqlContext`
        // req, res used in http/query&mutations, connection used in webSockets/subscriptions
        context: ({ req, res, payload, connection }: GqlContext) => ({ req, res, payload, connection }),
        // configure graphql cors here
        cors: {
          origin: e.corsOriginReactFrontend,
          credentials: true,
        },
        // subscriptions/webSockets authentication
        subscriptions: {
          // get headers
          onConnect: (connectionParams: ConnectionParams) => {
            // convert header keys to lowercase
            const connectionParamsLowerKeys = mapKeysToLowerCase(connectionParams);
            // get authToken from authorization header
            const authToken: string = ('authorization' in connectionParamsLowerKeys)
              && connectionParamsLowerKeys.authorization.split(' ')[1];
            if (authToken) {
              // verify authToken/getJwtPayLoad
              const jwtPayload: GqlContextPayload = authService.getJwtPayLoad(authToken);
              // the user/jwtPayload object found will be available as context.currentUser/jwtPayload in your GraphQL resolvers
              return { currentUser: jwtPayload.username, jwtPayload, headers: connectionParamsLowerKeys };
            }
            throw new AuthenticationError('authToken must be provided');
          },
        },
      }),
      // inject: AuthService
      inject: [AuthService],
    }),    
    // apolloServer config: use forRootAsync to import AuthModule and inject AuthService
    // old without ConfigService
    // AuthModule,
    // auth module
    AuthModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // TODO: use thie vars in auth module
        accessTokenJwtSecret: configService.get('ACCESS_TOKEN_JWT_SECRET'),
        accessTokenExpiresIn: configService.get('ACCESS_TOKEN_EXPIRES_IN'),
        refreshTokenJwtSecret: configService.get('REFRESH_TOKEN_JWT_SECRET'),
        refreshTokenExpiresIn: configService.get('REFRESH_TOKEN_EXPIRES_IN'),
        refreshTokenSkipIncrementVersion: configService.get('REFRESH_TOKEN_SKIP_INCREMENT_VERSION'),
      }),
    }),
    // old without ConfigService
    // UserModule,
    // users Module
    UserModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        useMokeData: Boolean(
          configService.get('USER_SERVICE_USE_MOKE_DATA') === 'true' ? true : false,
        ),
      }),
    }),
    // neo4j    
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
    // fabric network
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
        saveEventsPath: configService.get('NETWORK_SAVE_EVENTS_PATH'),
      }),
    }),
  ],
})

export class AppModule { }
