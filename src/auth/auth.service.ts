import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { SignOptions } from 'jsonwebtoken';
import { GqlContextPayload } from '../common/types';
import { UserService } from '../user/user.service';
import { AUTH_CONFIG } from './auth.constants';
import { AuthConfig } from './interfaces';
import AccessToken from './types/access-token';

@Injectable()
export class AuthService {
  constructor(
    // require to use @Inject(AUTH_CONFIG)
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
    // here @Inject(Class) is optional
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) { }
  // called by GqlLocalAuthGuard
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    if (user) {
      const authorized = this.bcryptValidate(pass, user.password);
      if (authorized) {
        // this will remove password from result leaving all the other properties
        const { password,...result } = user;
        // we could do a database lookup in our validate() method to extract more information about the user,
        // resulting in a more enriched user object being available in our Request
        return result;
      }
    }
    return null;
  }

  async signJwtToken(user: any, options?: SignOptions): Promise<AccessToken> {
    // note: we choose a property name of sub to hold our userId value to be consistent with JWT standards
    const payload = { username: user.username, sub: user.userId, roles: user.roles };
    return {
      // generate JWT from a subset of the user object properties
      accessToken: this.jwtService.sign(payload, options),
    };
  }

  async signRefreshToken(user: any, tokenVersion: number, options?: SignOptions): Promise<AccessToken> {
    const payload = { username: user.username, sub: user.userId, roles: user.roles, tokenVersion };
    return {
      // generate JWT from a subset of the user object properties
      accessToken: this.jwtService.sign(
        payload, { 
          ...options, 
          // require to use refreshTokenJwtSecret
          secret: this.config.refreshTokenJwtSecret,
          expiresIn: this.config.refreshTokenExpiresIn,
        }),
    };
  }

  sendRefreshToken(res: Response, { accessToken }: AccessToken): void {
    res.cookie('jid', accessToken, {
      // prevent javascript access
      httpOnly: true,
    });
  }

  getJwtPayLoad(token: string): GqlContextPayload {
    return this.jwtService.verify(token);
  }

  bcryptValidate = (password: string, hashPassword: string): boolean => {
    return bcrypt.compareSync(password, hashPassword);
  }
}
