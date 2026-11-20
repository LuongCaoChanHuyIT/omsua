import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createCorsOriginDelegate } from './config/cors.config';

export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: createCorsOriginDelegate(configService.get<string>('CORS_ORIGINS')),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('OmSua API')
    .setDescription('OmSua Backend REST API Documentation')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    autoTagControllers: false,
  });
  SwaggerModule.setup('api/docs', app, document);
}
