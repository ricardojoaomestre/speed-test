export const SPREADSHEET_EXTENSIONS = [".csv", ".xls", ".xlsx"] as const;

export type SpreadsheetExtension =
  (typeof SPREADSHEET_EXTENSIONS)[number];

export type SpreadsheetFileType = "csv" | "xls" | "xlsx";

export type SpreadsheetRow = Record<
  string,
  string | number | boolean | null | Date
>;

export type ParsedSpreadsheetJson = {
  fileType: SpreadsheetFileType;
  sheets: Record<string, SpreadsheetRow[]>;
};

export type SpreadsheetValidationResult =
  | { ok: true; fileType: SpreadsheetFileType }
  | { ok: false; error: string };

export type ImportedSpreadsheetRow = {
  date: string | null;
  description: string;
  value: number | null;
  balance?: number | null;
  categoryId: string | null;
};
