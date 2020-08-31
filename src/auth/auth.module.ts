import { CookieParserMiddleware } from '@nest-middlewares/cookie-parser';
import { Provider, DynamicModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { envVariables as e } from '../common/env';
import { UsersModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { AUTH_CONFIG } from './auth.constants';

@Module({})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieParserMiddleware).forRoutes('/refresh-token');
  }

  static forRootAsync(configProvider): DynamicModule {
    return {
      module: AuthModule,
      global: true,
      imports: [
        ConfigModule,
        UsersModule,
        // not used because we use a class based strategy GqlAuthGuard
        // configure the JwtModule using register(), passing configuration object, and register a default strategy
        // PassportModule.register({
        //   defaultStrategy: 'jwt',
        // }),
        JwtModule.register({
          secret: e.accessTokenJwtSecret,
          signOptions: { expiresIn: e.accessTokenExpiresIn },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        AuthResolver,
        LocalStrategy,
        JwtStrategy,
        {
          provide: AUTH_CONFIG,
          ...configProvider,
        } as Provider<any>,
      ],
      exports: [AuthService],
    };
  }
}
