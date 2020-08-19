import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { initDirectories } from './main.util';
import { httpsOptions } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  // initDirectories
  await initDirectories([process.env.NETWORK_SAVE_EVENTS_PATH])
    .catch((error) => Logger.error(error, 'Main'));
  // starts listening for shutdown hooks
  app.enableShutdownHooks();
  // server setup
  const port: number = Number(process.env.HTTPS_SERVER_PORT) || 543;
  Logger.log(`server listening on port ${port}`, 'Main');
  await app.listen(port);
}
bootstrap();
