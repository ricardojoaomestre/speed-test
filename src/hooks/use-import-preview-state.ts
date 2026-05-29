import { useReducer } from 'react';

import type { ParsedImportRow } from '@/app/(protected)/dashboard/actions/import-file';
import type { MerchantSlug } from '@/lib/merchants';

export type ImportPreviewState = {
  parsedData: ParsedImportRow[] | null;
  filename: string | null;
  error: string | null;
  merchant: MerchantSlug | undefined;
};

export type ImportPreviewAction =
  | { type: 'parse-started' }
  | {
      type: 'parse-succeeded';
      data: ParsedImportRow[];
      filename: string | null;
    }
  | { type: 'parse-failed'; error: string }
  | { type: 'confirm-failed'; error: string }
  | { type: 'clear-preview' }
  | { type: 'reset' }
  | { type: 'set-merchant'; merchant: MerchantSlug };

const initialState: ImportPreviewState = {
  parsedData: null,
  filename: null,
  error: null,
  merchant: undefined,
};

function importPreviewReducer(
  state: ImportPreviewState,
  action: ImportPreviewAction,
): ImportPreviewState {
  switch (action.type) {
    case 'parse-started':
      return {
        ...state,
        error: null,
        parsedData: null,
        filename: null,
      };
    case 'parse-succeeded':
      return {
        ...state,
        error: null,
        parsedData: action.data,
        filename: action.filename,
      };
    case 'parse-failed':
    case 'confirm-failed':
      return { ...state, error: action.error };
    case 'clear-preview':
      return {
        ...state,
        parsedData: null,
        filename: null,
        error: null,
      };
    case 'reset':
      return initialState;
    case 'set-merchant':
      if (state.parsedData) {
        return { ...initialState, merchant: action.merchant };
      }
      return { ...state, merchant: action.merchant };
  }
}

export function useImportPreviewState() {
  return useReducer(importPreviewReducer, initialState);
}
