import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { setupSwagger } from './swagger.config';

export function setupApplication(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.getOrThrow<string>('app.apiPrefix');
  const corsOrigins = configService.getOrThrow<string[]>('app.corsOrigins');
  const swaggerEnabled = configService.getOrThrow<boolean>('swagger.enabled');
  const swaggerPath = configService.getOrThrow<string>('swagger.path');

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet());
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableShutdownHooks();

  if (swaggerEnabled) {
    setupSwagger(app, swaggerPath);
  }
}
