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
});
