import { EXTENSION_TO_FILE_TYPE, SPREADSHEET_MIME_TYPES } from "./constants";
import type {
  SpreadsheetFileType,
  SpreadsheetValidationResult,
} from "./types";

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return "";
  return filename.slice(dot).toLowerCase();
}

export function getSpreadsheetFileTypeFromName(
  filename: string,
): SpreadsheetFileType | null {
  const ext = getExtension(filename);
  return EXTENSION_TO_FILE_TYPE[ext] ?? null;
}

export function getSpreadsheetFileTypeFromMime(
  mimeType: string,
): SpreadsheetFileType | null {
  const normalized = mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
  for (const [fileType, mimes] of Object.entries(SPREADSHEET_MIME_TYPES)) {
    if (mimes.includes(normalized)) {
      return fileType as SpreadsheetFileType;
    }
  }
  return null;
}

export function resolveSpreadsheetFileType(
  filename: string,
  mimeType: string,
): SpreadsheetFileType | null {
  const fromName = getSpreadsheetFileTypeFromName(filename);
  const fromMime = getSpreadsheetFileTypeFromMime(mimeType);

  if (fromName && fromMime && fromName !== fromMime) {
    return null;
  }

  return fromName ?? fromMime;
}

export function validateSpreadsheetFile(file: {
  name: string;
  type: string;
  size: number;
}): SpreadsheetValidationResult {
  if (file.size === 0) {
    return { ok: false, error: "File is empty." };
  }

  const fileType = resolveSpreadsheetFileType(file.name, file.type);

  if (!fileType) {
    return {
      ok: false,
      error: "Unsupported file type. Use CSV, XLS, or XLSX.",
    };
  }

  return { ok: true, fileType };
}

export function isSupportedSpreadsheetFile(file: {
  name: string;
  type: string;
}): boolean {
  return resolveSpreadsheetFileType(file.name, file.type) !== null;
}
