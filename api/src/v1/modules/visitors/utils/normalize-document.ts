import type { DocumentType } from '../dto/create-visitor.dto';

export function normalizeDocument(
  _type: DocumentType,
  document: string,
): string {
  return document.replace(/\D/g, '');
}

export function isValidDocument(
  _type: DocumentType,
  document: string,
): boolean {
  if (!/^\d{11}$/.test(document) || /^(\d)\1{10}$/.test(document)) return false;

  const calculateDigit = (length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(document[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return (
    calculateDigit(9) === Number(document[9]) &&
    calculateDigit(10) === Number(document[10])
  );
}
