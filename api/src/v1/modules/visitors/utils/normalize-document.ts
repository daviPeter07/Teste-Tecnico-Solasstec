import type { DocumentType } from '../dto/create-visitor.dto';

export function normalizeDocument(
  type: DocumentType,
  document: string,
): string {
  if (type === 'CPF') return document.replace(/\D/g, '');
  return document.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidDocument(type: DocumentType, document: string): boolean {
  if (type === 'RG') {
    return (
      /^[A-Z0-9]{7,14}$/.test(document) && !/^([A-Z0-9])\1+$/.test(document)
    );
  }

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
