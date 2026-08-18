import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3333),
  API_PREFIX: Joi.string().trim().default('api/v1'),
  BUSINESS_TIME_ZONE: Joi.string().default('America/Manaus'),
  CORS_ORIGIN: Joi.string().trim().allow('').optional(),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  SWAGGER_ENABLED: Joi.boolean().truthy('true').falsy('false').default(true),
  SWAGGER_PATH: Joi.string().trim().default('docs'),
});
