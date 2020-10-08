import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getEnvVariables as e, initDirectories } from './common';
import { httpsOptions } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  // initDirectories
  await initDirectories([e().networkSaveEventsPath])
    .catch((error) => Logger.error(error, 'Main'));
  // starts listening for shutdown hooks
  app.enableShutdownHooks();
  // server setup  
  Logger.log(`server listening on port ${e().httpsPort}`, 'Main');
  await app.listen(e().httpsPort);
}
bootstrap();
