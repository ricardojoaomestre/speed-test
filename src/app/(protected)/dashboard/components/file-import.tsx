'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, useTransition } from 'react';

import { confirmImport } from '@/app/(protected)/dashboard/actions/confirm-import';
import { importSpreadsheetFile } from '@/app/(protected)/dashboard/actions/import-file';
import {
  getPreviewColumns,
  type PreviewRow,
} from '@/app/(protected)/dashboard/components/import-columns';
import { ImportDataTable } from '@/app/(protected)/dashboard/components/import-data-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSpreadsheetFile } from '@/hooks/use-spreadsheet-file';
import {
  type ImportedSpreadsheetRow,
  validateImportRow,
} from '@/lib/file-import';

const FileImport = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { validation, validate, clear } = useSpreadsheetFile();
  const [parsedData, setParsedData] = useState<ImportedSpreadsheetRow[] | null>(
    null,
  );
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, startParseTransition] = useTransition();
  const [isConfirming, startConfirmTransition] = useTransition();

  const previewRows: PreviewRow[] | null = useMemo(() => {
    if (!parsedData) return null;
    return parsedData.map((row) => ({
      ...row,
      validation: validateImportRow(row),
    }));
  }, [parsedData]);

  const columns = useMemo(() => {
    const includeBalance = parsedData?.some((row) => row.balance !== undefined);
    return getPreviewColumns(includeBalance ?? false);
  }, [parsedData]);

  const validCount = previewRows?.filter((row) => row.validation.valid).length ?? 0;

  const resetPreview = () => {
    setParsedData(null);
    setFilename(null);
    setError(null);
    formRef.current?.reset();
    clear();
  };

  return (
    <TooltipProvider>
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <form
          ref={formRef}
          action={(formData) => {
            startParseTransition(async () => {
              setError(null);
              setParsedData(null);
              setFilename(null);

              const file = formData.get('file');
              const parsedFilename =
                file instanceof File ? file.name : null;

              const result = await importSpreadsheetFile(formData);

              if (!result.ok) {
                setError(result.error);
                return;
              }

              setParsedData(result.data);
              setFilename(parsedFilename);
              formRef.current?.reset();
              clear();
            });
          }}
        >
          <Field>
            <FieldLabel htmlFor="file">Select a file to import</FieldLabel>
            <Input
              type="file"
              id="file"
              name="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => validate(e.target.files?.[0] ?? null)}
            />
            {validation?.ok === false && (
              <FieldError>{validation.error}</FieldError>
            )}
          </Field>
          <Button
            type="submit"
            disabled={validation?.ok !== true || isParsing || !!previewRows}
            className="mt-4"
          >
            {isParsing ? 'Parsing…' : 'Parse file'}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Import failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {previewRows && filename && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{filename}</p>
              <p className="text-sm text-muted-foreground">
                {previewRows.length} row{previewRows.length === 1 ? '' : 's'}{' '}
                parsed · {validCount} valid
                {validCount < previewRows.length &&
                  ` · ${previewRows.length - validCount} will be skipped`}
              </p>
            </div>
            <ImportDataTable columns={columns} data={previewRows} />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isConfirming}
                onClick={resetPreview}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isConfirming || validCount === 0}
                onClick={() => {
                  startConfirmTransition(async () => {
                    setError(null);

                    const result = await confirmImport({
                      filename,
                      rows: parsedData!,
                    });

                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }

                    router.push('/transactions');
                  });
                }}
              >
                {isConfirming ? 'Confirming…' : 'Confirm import'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FileImport;
