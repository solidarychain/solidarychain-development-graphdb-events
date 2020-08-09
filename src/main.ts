import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { initDirectories } from './main.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // initDirectories
  await initDirectories([process.env.NETWORK_SAVE_EVENTS_PATH])
    .catch((error) => Logger.error(error));
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  const port: number = Number(process.env.SERVER_PORT) || 3000;
  Logger.verbose(`server listening on port ${port}`);
  await app.listen(port);
}
bootstrap();
