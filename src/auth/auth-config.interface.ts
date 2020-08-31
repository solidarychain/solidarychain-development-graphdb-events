export interface AuthConfig {
  accessTokenJwtSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenJwtSecret: string;
  refreshTokenExpiresIn: string;
  refreshTokenSkipIncrementVersion: string;
}
