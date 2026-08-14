import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, path: string): void {
  const config = new DocumentBuilder()
    .setTitle('Solasstec Portaria API')
    .setDescription(
      'API para controle de visitantes, salas, feriados e agendamentos.',
    )
    .setVersion('1.0')
    .addTag('Health', 'Disponibilidade da API e de suas dependências')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(path, app, document, {
    customSiteTitle: 'Solasstec Portaria API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
