import { Controller, HttpStatus, Inject, Logger, Post, Request, Response } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlContextPayload } from '../common/types';
import { LoginUserInput } from '../user/dto';
import { User } from '../user/models';
import { UserService } from '../user/user.service';
import { AUTH_CONFIG } from './auth.constants';
import { AuthService } from './auth.service';
import { AuthConfig } from './interfaces';
import { AccessToken } from './models';

@Controller()
export class AuthController {
  constructor(
    // require to use @Inject(AUTH_CONFIG)
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
    // here @Inject(Class) is optional
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) { }
  // for security purposes, refreshToken cookie only works in this specific route,
  // to request a new accessToken, this prevent /graphql to works with cookie

  @Post('/refresh-token')
  async refreshToken(
    @Request() req,
    @Response() res,
  ): Promise<any> {
    // Logger.log(`headers ${JSON.stringify(req.headers, undefined, 2)}`, AuthController.name);
    // Logger.log(`cookies ${JSON.stringify(req.cookies, undefined, 2)}`, AuthController.name);
    const invalidPayload = () => res.status(HttpStatus.UNAUTHORIZED).send({ valid: false, accessToken: '' });
    // get jid token from cookies
    const token: string = (req.cookies && req.cookies.jid) ? req.cookies.jid : null;
    // check if jid token is present
    if (!token) {
      return invalidPayload();
    }

    let payload: GqlContextPayload;
    try {
      payload = this.jwtService.verify(token, { secret: this.config.refreshTokenJwtSecret});
    } catch (error) {
      Logger.error(error, AuthController.name);
      return invalidPayload();
    }

    // token is valid, send back accessToken
    const user: User = await this.userService.findOneByUsername(payload.username);
    // check jid token
    if (!user) {
      return invalidPayload();
    }

    // check inMemory tokenVersion
    const tokenVersion: number = this.userService.usersStore.getTokenVersion(user.username);
    if (tokenVersion !== payload.tokenVersion) {
      return invalidPayload();
    }

    // refresh the refreshToken on accessToken, this way we extended/reset refreshToken validity to default value
    const loginUserInput: LoginUserInput = { username: user.username, password: user.password };
    // we don't increment tokenVersion here, only when we login, this way refreshToken is always valid until we login again
    const refreshToken: AccessToken = await this.authService.signRefreshToken(loginUserInput, tokenVersion);
    // send refreshToken in response/setCookie
    this.authService.sendRefreshToken(res, refreshToken);

    const { accessToken }: AccessToken = await this.authService.signJwtToken(user);
    res.send({ valid: true, accessToken });
  }
}
