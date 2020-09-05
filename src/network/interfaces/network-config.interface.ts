interface GatewayDiscovery {
  enabled: boolean;
  asLocalhost: boolean;
}

export interface NetworkConfig {
  connectionFile: string;
  walletPath: string;
  chaincodeName: string;
  channelName: string;
  appAdmin: string;
  appAdminSecret: string;
  orgMSPID: string;
  caName: string;
  peer: string;
  orderer: string;
  peerIdentity: string;
  gatewayDiscovery: GatewayDiscovery;
  nodePriority: number;
  nodePriorityTimeout: number;
  saveEventsPath: string,
}
