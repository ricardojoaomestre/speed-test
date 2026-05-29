'use client';

import { useCallback, useReducer } from 'react';

import {
  type SpreadsheetFileType,
  type SpreadsheetValidationResult,
  validateSpreadsheetFile,
} from '@/lib/file-import';

type SpreadsheetFileState = {
  file: File | null;
  validation: SpreadsheetValidationResult | null;
};

type SpreadsheetFileAction =
  | { type: 'set-file'; file: File; validation: SpreadsheetValidationResult }
  | { type: 'clear' };

const initialState: SpreadsheetFileState = {
  file: null,
  validation: null,
};

function spreadsheetFileReducer(
  state: SpreadsheetFileState,
  action: SpreadsheetFileAction,
): SpreadsheetFileState {
  switch (action.type) {
    case 'clear':
      return initialState;
    case 'set-file':
      return {
        file: action.file,
        validation: action.validation,
      };
  }
}

export function useSpreadsheetFile() {
  const [state, dispatch] = useReducer(spreadsheetFileReducer, initialState);

  const validate = useCallback((next: File | null) => {
    if (!next) {
      dispatch({ type: 'clear' });
      return null;
    }

    const validation = validateSpreadsheetFile(next);
    dispatch({ type: 'set-file', file: next, validation });
    return validation;
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const fileType: SpreadsheetFileType | null =
    state.validation?.ok === true ? state.validation.fileType : null;

  return {
    file: state.file,
    fileType,
    validation: state.validation,
    isValid: state.validation?.ok === true,
    validate,
    clear,
  };
}
