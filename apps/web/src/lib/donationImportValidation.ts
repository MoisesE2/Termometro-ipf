/** Mesmas regras que `POST /donations` e `POST /donations/bulk` na API (zod). */
export type DonationImportRowInput = {
  donorName: string;
  quotaCount: number;
  amountPaid: number;
  paymentDate: string;
};

export function validateDonationForApiImport(row: DonationImportRowInput): string[] {
  const errors: string[] = [];
  const name = (row.donorName ?? "").trim();
  if (name.length < 2) {
    errors.push("Nome do doador deve ter no mínimo 2 caracteres.");
  }
  const qc = row.quotaCount;
  if (!Number.isInteger(qc) || qc <= 0) {
    errors.push("Quantidade de cotas deve ser um número inteiro maior que zero.");
  }
  const paid = row.amountPaid;
  if (!Number.isFinite(paid) || paid < 0) {
    errors.push("Valor pago deve ser um número maior ou igual a zero.");
  }
  const pd = (row.paymentDate ?? "").trim();
  if (!pd) {
    errors.push("Data de pagamento obrigatória.");
  } else {
    const d = new Date(pd.includes("T") ? pd : `${pd}T12:00:00`);
    if (Number.isNaN(d.getTime())) {
      errors.push("Data de pagamento inválida.");
    }
  }
  return errors;
}

export function partitionDonationsForApiImport(rows: DonationImportRowInput[]): {
  invalidApiRows: { index: number; donorName: string; errors: string[] }[];
  wouldImportCount: number;
} {
  const invalidApiRows: { index: number; donorName: string; errors: string[] }[] = [];
  rows.forEach((row, index) => {
    const errors = validateDonationForApiImport(row);
    if (errors.length > 0) {
      invalidApiRows.push({
        index,
        donorName: row.donorName?.trim() || "(sem nome)",
        errors,
      });
    }
  });
  return {
    invalidApiRows,
    wouldImportCount: rows.length - invalidApiRows.length,
  };
}
