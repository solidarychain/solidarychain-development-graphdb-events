import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envVariables as e, initDirectories } from './common';
import { httpsOptions } from './config';

async function bootstrap() {
  debugger;
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
