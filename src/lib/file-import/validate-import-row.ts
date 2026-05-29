import type { ImportedSpreadsheetRow } from './types';

export type RowValidation =
  | { valid: true }
  | { valid: false; errors: string[] };

const endOfToday = () => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
};

export function validateImportRow(row: ImportedSpreadsheetRow): RowValidation {
  const errors: string[] = [];

  if (!row.date) {
    errors.push('Missing valid date');
  } else {
    const date = new Date(row.date);
    if (Number.isNaN(date.getTime())) {
      errors.push('Missing valid date');
    } else if (date > endOfToday()) {
      errors.push('Date is in the future');
    }
  }

  if (!row.description.trim()) {
    errors.push('Description is required');
  }

  if (row.value === null || !Number.isFinite(row.value)) {
    errors.push('Value is invalid');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

export function isValidImportRow(row: ImportedSpreadsheetRow): boolean {
  return validateImportRow(row).valid;
}
