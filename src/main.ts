import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  const port: number = Number(process.env.SERVER_PORT) || 3000;
  Logger.verbose(`server listening on port ${port}`);
  await app.listen(port);
}
bootstrap();
