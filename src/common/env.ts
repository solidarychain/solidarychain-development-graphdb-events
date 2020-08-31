// env variables that are outside of ConfigService

export const envVariables: any = {
  // http/s server
  httpsPort: process.env.HTTPS_SERVER_PORT || 4443,
  httpsKeyFile: process.env.HTTPS_KEY_FILE || 'config/server.key',
  httpsCertFile: process.env.HTTPS_CERT_FILE || 'config/server.crt',
  // TODO: renove bellow after // TODO: use thie vars in auth module
  // auth
  // don't remove here is used auth.module.ts
  accessTokenJwtSecret: process.env.ACCESS_TOKEN_JWT_SECRET || 'secretKeyAccessToken',
  // don't remove here is used auth.module.ts
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenSkipIncrementVersion: process.env.REFRESH_TOKEN_SKIP_INCREMENT_VERSION || 'false',
  // can delete refreshTokenJwtSecret and refreshTokenExpiresIn, using this.config from injected service, better leave it here
  refreshTokenJwtSecret: process.env.REFRESH_TOKEN_JWT_SECRET || 'secretKeyRefreshToken',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  // cors origin react frontend
  corsOriginReactFrontend: process.env.CORS_ORIGIN_REACT_FRONTEND || 'https://localhost:3000',
  // paths
  networkSaveEventsPath: process.env.NETWORK_SAVE_EVENTS_PATH || 'data', 
};
