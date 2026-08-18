export function parseBooleanQuery(value: unknown, defaultValue: boolean) {
  if (value === undefined) return defaultValue;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}
