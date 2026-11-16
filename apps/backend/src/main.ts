import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DEFAULT_PORTS } from '@omsua/shared';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const configService = app.get(ConfigService);
  const rawPort = Number(configService.get<string>('PORT'));
  const port = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : DEFAULT_PORTS.BACKEND;

  await app.listen(port);
}

void bootstrap();
