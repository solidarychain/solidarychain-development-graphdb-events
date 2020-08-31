import { Module, MiddlewareConsumer, DynamicModule, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envVariables as e } from '../common/env';
import { UsersModule } from '../user/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { CookieParserMiddleware } from '@nest-middlewares/cookie-parser';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
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
  providers: [AuthService, AuthResolver, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})

export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieParserMiddleware).forRoutes('/refresh-token');
  }
  
  static forRootAsync(configProvider): DynamicModule {
    return {
      module: AuthModule,
      global: true,
      imports: [ConfigModule],
      providers: [AuthService],
      exports: [AuthService],
    };
  }
}
