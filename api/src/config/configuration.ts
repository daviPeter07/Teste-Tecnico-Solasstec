export const configuration = () => ({
  app: {
    name: 'solasstec-portaria-api',
    environment: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    apiPrefix: (process.env.API_PREFIX ?? 'api/v1')
      .trim()
      .replace(/^\/+|\/+$/g, ''),
    corsOrigins: (process.env.CORS_ORIGIN ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  swagger: {
    enabled: !['false', '0'].includes(
      (process.env.SWAGGER_ENABLED ?? 'true').trim().toLowerCase(),
    ),
    path: (process.env.SWAGGER_PATH ?? 'docs').trim().replace(/^\/+|\/+$/g, ''),
  },
});
