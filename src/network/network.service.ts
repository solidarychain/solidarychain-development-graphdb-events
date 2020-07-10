import { Injectable, Inject } from '@nestjs/common';
import { NetworkConfig } from './network-config.interface';
import { NETWORK_CONFIG } from './network.constants';

@Injectable()
export class NetworkService {
  constructor(
    @Inject(NETWORK_CONFIG) private readonly config: NetworkConfig
  ) { }

  getConfig(): NetworkConfig {
    return this.config;
  };
}