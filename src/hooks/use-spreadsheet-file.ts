"use client";

import { useCallback, useState } from "react";

import {
  type SpreadsheetFileType,
  type SpreadsheetValidationResult,
  validateSpreadsheetFile,
} from "@/lib/file-import";

export function useSpreadsheetFile() {
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] =
    useState<SpreadsheetValidationResult | null>(null);

  const validate = useCallback((next: File | null) => {
    setFile(next);

    if (!next) {
      setValidation(null);
      return null;
    }

    const result = validateSpreadsheetFile(next);
    setValidation(result);
    return result;
  }, []);

  const clear = useCallback(() => {
    setFile(null);
    setValidation(null);
  }, []);

  const fileType: SpreadsheetFileType | null =
    validation?.ok === true ? validation.fileType : null;

  return {
    file,
    fileType,
    validation,
    isValid: validation?.ok === true,
    validate,
    clear,
  };
}
