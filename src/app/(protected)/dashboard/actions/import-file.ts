"use server";

import {
  parseLocalizedNumber,
  parseSpreadsheetToJson,
  type SpreadsheetRow,
  validateSpreadsheetFile,
} from "@/lib/file-import";

export type ImportedSpreadsheetRow = {
  date: string | null;
  description: string;
  value: number | null;
  balance?: number | null;
};

export type ImportSpreadsheetResult =
  | { ok: true; data: ImportedSpreadsheetRow[] }
  | { ok: false; error: string };

const normalizeHeader = (header: string) =>
  header.trim().toLowerCase().replace(/\s+/g, " ");

const findColumnKey = (rows: SpreadsheetRow[], aliases: string[]) => {
  const normalizedAliases = aliases.map(normalizeHeader);

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (normalizedAliases.includes(normalizeHeader(key))) {
        return key;
      }
    }
  }

  return null;
};

const toNullableString = (value: SpreadsheetRow[string]) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length ? normalized : null;
};

const toIsoDateString = (value: SpreadsheetRow[string]) => {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const toNullableNumber = (value: SpreadsheetRow[string]) => {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return parseLocalizedNumber(String(value));
};

export async function importSpreadsheetFile(
  formData: FormData,
): Promise<ImportSpreadsheetResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false as const, error: "No file provided." };
  }

  const validation = validateSpreadsheetFile(file);

  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  const buffer = await file.arrayBuffer();
  const parsed = parseSpreadsheetToJson(
    buffer,
    file.name,
    validation.fileType,
  );

  const firstNonEmptySheet = Object.values(parsed.sheets).find(
    (rows) => rows.length > 0,
  );

  if (!firstNonEmptySheet) {
    return {
      ok: false as const,
      error: "Could not find any rows in the spreadsheet.",
    };
  }

  const dateColumn = findColumnKey(firstNonEmptySheet, ["date"]);
  const descriptionColumn = findColumnKey(firstNonEmptySheet, [
    "description",
  ]);
  const valueColumn = findColumnKey(firstNonEmptySheet, ["value"]);
  const balanceColumn = findColumnKey(firstNonEmptySheet, ["balance"]);

  if (!dateColumn || !descriptionColumn || !valueColumn) {
    return {
      ok: false as const,
      error:
        "Spreadsheet must include Date, Description, and Value columns.",
    };
  }

  const data: ImportedSpreadsheetRow[] = firstNonEmptySheet
    .map((row) => {
      const mappedRow: ImportedSpreadsheetRow = {
        date: toIsoDateString(row[dateColumn]),
        description: toNullableString(row[descriptionColumn]) ?? "",
        value: toNullableNumber(row[valueColumn]),
      };

      if (balanceColumn) {
        mappedRow.balance = toNullableNumber(row[balanceColumn]);
      }

      return mappedRow;
    })
    .filter(
      (row) =>
        row.date !== null ||
        row.description.length > 0 ||
        row.value !== null ||
        (row.balance ?? null) !== null,
    );

  return { ok: true as const, data };
}
