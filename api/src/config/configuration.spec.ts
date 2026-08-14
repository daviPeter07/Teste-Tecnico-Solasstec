import { configuration } from './configuration';

describe('configuration', () => {
  const originalApiPrefix = process.env.API_PREFIX;
  const originalSwaggerEnabled = process.env.SWAGGER_ENABLED;
  const originalSwaggerPath = process.env.SWAGGER_PATH;

  afterEach(() => {
    restoreEnv('API_PREFIX', originalApiPrefix);
    restoreEnv('SWAGGER_ENABLED', originalSwaggerEnabled);
    restoreEnv('SWAGGER_PATH', originalSwaggerPath);
  });

  it('normalizes paths and case-insensitive booleans', () => {
    process.env.API_PREFIX = ' /custom/v1/ ';
    process.env.SWAGGER_ENABLED = 'FALSE';
    process.env.SWAGGER_PATH = ' /openapi/ ';

    const config = configuration();

    expect(config.app.apiPrefix).toBe('custom/v1');
    expect(config.swagger.enabled).toBe(false);
    expect(config.swagger.path).toBe('openapi');
  });
});

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
