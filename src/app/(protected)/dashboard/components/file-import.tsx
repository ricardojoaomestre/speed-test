'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import { confirmImport } from '@/app/(protected)/dashboard/actions/confirm-import';
import {
  importSpreadsheetFile,
  type ParsedImportRow,
} from '@/app/(protected)/dashboard/actions/import-file';
import {
  getPreviewColumns,
  type PreviewRow,
} from '@/app/(protected)/dashboard/components/import-columns';
import { ImportDataTable } from '@/app/(protected)/dashboard/components/import-data-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSpreadsheetFile } from '@/hooks/use-spreadsheet-file';
import { validateImportRow } from '@/lib/file-import';
import {
  isMerchantSlug,
  MERCHANTS_SORTED_BY_LABEL,
  type MerchantSlug,
} from '@/lib/merchants';

type FileImportProps = {
  onPreviewChange?: (active: boolean) => void;
};

const FileImport = ({ onPreviewChange }: FileImportProps) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { validation, validate, clear } = useSpreadsheetFile();
  const [parsedData, setParsedData] = useState<ParsedImportRow[] | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<MerchantSlug | undefined>();
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

  const importableCount =
    previewRows?.filter(
      (row) => row.validation.valid && !row.duplicate.isDuplicate,
    ).length ?? 0;

  const duplicateCount =
    previewRows?.filter(
      (row) => row.validation.valid && row.duplicate.isDuplicate,
    ).length ?? 0;

  const invalidCount =
    previewRows?.filter((row) => !row.validation.valid).length ?? 0;

  useEffect(() => {
    onPreviewChange?.(!!previewRows && !!filename);
  }, [previewRows, filename, onPreviewChange]);

  const clearPreview = () => {
    setParsedData(null);
    setFilename(null);
    setError(null);
    formRef.current?.reset();
    clear();
  };

  const resetPreview = () => {
    clearPreview();
    setMerchant(undefined);
  };

  const handleMerchantChange = (value: string) => {
    if (!isMerchantSlug(value)) return;

    setMerchant(value);

    if (parsedData) {
      clearPreview();
    }
  };

  const summaryParts = previewRows
    ? [
        `${previewRows.length} row${previewRows.length === 1 ? '' : 's'} parsed`,
        `${importableCount} importable`,
        duplicateCount > 0
          ? `${duplicateCount} duplicate${duplicateCount === 1 ? '' : 's'}`
          : null,
        invalidCount > 0
          ? `${invalidCount} invalid`
          : null,
      ].filter(Boolean)
    : [];

  return (
    <TooltipProvider>
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <Field>
          <FieldLabel htmlFor="merchant">Merchant</FieldLabel>
          <Select value={merchant} onValueChange={handleMerchantChange}>
            <SelectTrigger id="merchant" className="w-full max-w-md">
              <SelectValue placeholder="Select merchant" />
            </SelectTrigger>
            <SelectContent>
              {MERCHANTS_SORTED_BY_LABEL.map(({ slug, label }) => (
                <SelectItem key={slug} value={slug}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <form
          ref={formRef}
          action={(formData) => {
            if (!merchant) return;

            startParseTransition(async () => {
              setError(null);
              setParsedData(null);
              setFilename(null);

              formData.set('merchant', merchant);

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
              disabled={!merchant}
              onChange={(e) => validate(e.target.files?.[0] ?? null)}
            />
            {validation?.ok === false && (
              <FieldError>{validation.error}</FieldError>
            )}
          </Field>
          <Button
            type="submit"
            disabled={
              !merchant ||
              validation?.ok !== true ||
              isParsing ||
              !!previewRows
            }
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

        {previewRows && filename && merchant && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{filename}</p>
              <p className="text-sm text-muted-foreground">
                {summaryParts.join(' · ')}
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
                disabled={isConfirming}
                onClick={() => {
                  startConfirmTransition(async () => {
                    setError(null);

                    const result = await confirmImport({
                      filename,
                      merchant,
                      rows: parsedData!,
                    });

                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }

                    if (result.importedCount === 0) {
                      router.push(`/imports/${result.importId}`);
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
