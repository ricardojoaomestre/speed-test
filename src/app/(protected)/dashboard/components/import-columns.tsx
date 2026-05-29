"use client";
import type { ColumnDef } from "@tanstack/react-table";

import type { ImportedSpreadsheetRow } from "@/lib/file-import";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDisplayDate, formatDisplayNumber } from "@/lib/formatters";
import type { RowValidation } from "@/lib/file-import";

export type PreviewRow = ImportedSpreadsheetRow & {
  validation: RowValidation;
};

const validationColumn: ColumnDef<PreviewRow> = {
  id: "validation",
  header: "Validation",
  cell: ({ row }) => {
    const validation = row.original.validation;

    if (validation.valid) {
      return <Badge variant="success">Valid</Badge>;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive" className="cursor-default">
            Invalid
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <ul className="list-inside list-disc space-y-0.5">
            {validation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    );
  },
};

const balanceColumn: ColumnDef<PreviewRow> = {
  accessorKey: "balance",
  header: () => <div className="text-right">Balance</div>,
  cell: ({ row }) => (
    <div className="text-right tabular-nums">
      {formatDisplayNumber(row.getValue("balance"))}
    </div>
  ),
};

const baseColumns: ColumnDef<PreviewRow>[] = [
  validationColumn,
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDisplayDate(row.getValue("date")),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="whitespace-normal">{row.getValue("description")}</span>
    ),
  },
  {
    accessorKey: "value",
    header: () => <div className="text-right">Value</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatDisplayNumber(row.getValue("value"))}
      </div>
    ),
  },
];

export function getPreviewColumns(
  includeBalance: boolean,
): ColumnDef<PreviewRow>[] {
  if (includeBalance) {
    return [...baseColumns, balanceColumn];
  }
  return baseColumns;
}

