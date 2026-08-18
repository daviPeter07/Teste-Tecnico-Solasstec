import { normalize } from "@/utils/normalize";

export function formatVisitorDocument(documentType: string, document: string) {
  if (documentType === "CPF") return normalize.cpf(document);
  if (documentType === "RG") return normalize.rg(document);
  return document;
}

export function getVisitorDocumentLabel(documentType: string, document: string) {
  return `${documentType} ${formatVisitorDocument(documentType, document)}`;
}
