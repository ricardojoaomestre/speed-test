import type { SpreadsheetFileType } from "./types";

export const SPREADSHEET_MIME_TYPES: Record<SpreadsheetFileType, string[]> = {
  csv: ["text/csv", "application/csv", "text/plain"],
  xls: ["application/vnd.ms-excel"],
  xlsx: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

export const EXTENSION_TO_FILE_TYPE: Record<string, SpreadsheetFileType> = {
  ".csv": "csv",
  ".xls": "xls",
  ".xlsx": "xlsx",
};
