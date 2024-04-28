import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(__dirname, '../uploads'), {
    prefix: '/public/',
  });
  app.enableCors({ origin: process.env.ALLOWED_ORIGIN?.split(',') });
  await app.listen(process.env.APP_PORT || 4000);
}
bootstrap();
