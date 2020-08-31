export interface AuthConfig {
  accessTokenJwtSecret: string;
  accessTokenExpiresIn: string;
  // bust be any else give error
  refreshTokenJwtSecret: any;
  refreshTokenExpiresIn: string;
  refreshTokenSkipIncrementVersion: string;
}
