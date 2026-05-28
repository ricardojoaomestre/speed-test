import * as XLSX from "@e965/xlsx";

import { getSpreadsheetFileTypeFromName } from "./detect-file-type";
import type { ParsedSpreadsheetJson, SpreadsheetFileType } from "./types";

export function parseSpreadsheetToJson(
  data: ArrayBuffer,
  filename: string,
  fileType?: SpreadsheetFileType,
): ParsedSpreadsheetJson {
  const resolvedType =
    fileType ?? getSpreadsheetFileTypeFromName(filename);

  if (!resolvedType) {
    throw new Error("Cannot parse file: unsupported spreadsheet type.");
  }

  const payload =
    resolvedType === "csv"
      ? new TextDecoder().decode(data)
      : new Uint8Array(data);

  const workbook = XLSX.read(payload, {
    type: resolvedType === "csv" ? "string" : "array",
    cellDates: true,
    raw: false,
  });

  const sheets: ParsedSpreadsheetJson["sheets"] = {};

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: false,
    });
  }

  return { fileType: resolvedType, sheets };
}
