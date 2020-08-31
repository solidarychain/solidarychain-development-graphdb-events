import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { initDirectories } from './main.util';
import { httpsOptions } from './config';
import { envVariables as e } from './common/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  // initDirectories
  await initDirectories([e.networkSaveEventsPath])
    .catch((error) => Logger.error(error, 'Main'));
  // starts listening for shutdown hooks
  app.enableShutdownHooks();
  // server setup
  const port: number = Number(e.httpsPort);
  Logger.log(`server listening on port ${port}`, 'Main');
  await app.listen(port);
}
bootstrap();
