"use client";

import { useMemo, useRef, useState, useTransition } from "react";

import {
  importSpreadsheetFile,
  type ImportedSpreadsheetRow,
} from "@/app/(protected)/dashboard/actions/import-file";
import {
  importColumns,
  importColumnsWithBalance,
} from "@/app/(protected)/dashboard/components/import-columns";
import { ImportDataTable } from "@/app/(protected)/dashboard/components/import-data-table";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSpreadsheetFile } from "@/hooks/use-spreadsheet-file";

const FileImport = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { validation, validate, clear } = useSpreadsheetFile();
  const [parsedData, setParsedData] = useState<ImportedSpreadsheetRow[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns = useMemo(() => {
    if (parsedData?.some((row) => row.balance !== undefined)) {
      return importColumnsWithBalance;
    }
    return importColumns;
  }, [parsedData]);

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <form
        ref={formRef}
        action={(formData) => {
          startTransition(async () => {
            setError(null);
            setParsedData(null);

            const result = await importSpreadsheetFile(formData);

            if (!result.ok) {
              setError(result.error);
              return;
            }

            setParsedData(result.data);
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
            <p className="text-sm text-destructive">{validation.error}</p>
          )}
        </Field>
        <Button
          type="submit"
          disabled={validation?.ok !== true || isPending}
          className="mt-4"
        >
          {isPending ? "Importing…" : "Import"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {parsedData && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {parsedData.length} row{parsedData.length === 1 ? "" : "s"} imported
          </p>
          <ImportDataTable columns={columns} data={parsedData} />
        </div>
      )}
    </div>
  );
};

export default FileImport;
