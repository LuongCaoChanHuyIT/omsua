import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { resolveBackendPort } from './config/cors.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const configService = app.get(ConfigService);
  const port = resolveBackendPort({
    BACKEND_PORT: configService.get<string>('BACKEND_PORT'),
    PORT: configService.get<string>('PORT'),
  });

  await app.listen(port);
}

void bootstrap();
