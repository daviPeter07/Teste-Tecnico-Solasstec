import {
  isValidDocument,
  normalizeDocument,
} from '../../utils/normalize-document';

describe('visitor document utilities', () => {
  it('normalizes and validates CPF', () => {
    const document = normalizeDocument('CPF', '529.982.247-25');
    expect(document).toBe('52998224725');
    expect(isValidDocument('CPF', document)).toBe(true);
  });

  it('rejects repeated CPF digits', () => {
    expect(isValidDocument('CPF', '11111111111')).toBe(false);
  });

  it('normalizes and validates RG', () => {
    const document = normalizeDocument('RG', '12.345.678-X');
    expect(document).toBe('12345678X');
    expect(isValidDocument('RG', document)).toBe(true);
  });

  it('rejects invalid RG values', () => {
    expect(isValidDocument('RG', '123')).toBe(false);
    expect(isValidDocument('RG', '1111111')).toBe(false);
  });
});
