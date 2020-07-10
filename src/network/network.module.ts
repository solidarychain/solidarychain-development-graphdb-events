import { Module, DynamicModule, Provider } from '@nestjs/common';
import { NetworkService } from './network.service';
import { ConfigModule } from '@nestjs/config';
import { NETWORK_CONFIG } from './network.constants';

@Module({
  providers: [NetworkService]
})

export class NetworkModule {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static forRootAsync(configProvider): DynamicModule {
    return {
      module: NetworkModule,
      global: true,
      imports: [ConfigModule],
      providers: [
        NetworkService,
        {
          provide: NETWORK_CONFIG,
          ...configProvider
        } as Provider<any>,
        // {
        //   provide: NEO4J_DRIVER,
        //   inject: [NEO4J_CONFIG],
        //   useFactory: async (config: NetworkConfig): Promise<Driver> => {
        //     return createDriver(config);
        //   },
        // },
      ],
      exports: [
        NetworkService,
      ]
    }
  }
}
