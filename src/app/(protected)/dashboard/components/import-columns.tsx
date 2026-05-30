"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import type { ImportedSpreadsheetRow, RowDuplicateStatus, RowValidation } from "@/lib/file-import";
import { getDuplicateTooltipMessage } from "@/lib/file-import";
import type { ImportCategoryOption } from "@/lib/categories/get-active-categories-for-import";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDisplayDate, formatDisplayNumber } from "@/lib/formatters";

export type PreviewRow = ImportedSpreadsheetRow & {
  validation: RowValidation;
  duplicate: RowDuplicateStatus;
};

const NONE_CATEGORY_VALUE = "__none__";

const validationColumn: ColumnDef<PreviewRow> = {
  id: "validation",
  header: "Validation",
  cell: ({ row }) => {
    const validation = row.original.validation;

    if (!validation.valid) {
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
    }

    const duplicate = row.original.duplicate;

    if (duplicate.isDuplicate) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="warning" className="cursor-default">
              Duplicate
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {getDuplicateTooltipMessage(duplicate.reason)}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <Badge variant="success">Valid</Badge>;
  },
};

function createCategoryColumn(
  categories: ImportCategoryOption[],
  onCategoryChange: (rowIndex: number, categoryId: string | null) => void,
): ColumnDef<PreviewRow> {
  return {
    id: "category",
    header: "Category",
    cell: ({ row }) => {
      const categoryId = row.original.categoryId;
      const value = categoryId ?? NONE_CATEGORY_VALUE;

      return (
        <Select
          value={value}
          onValueChange={(next) => {
            onCategoryChange(
              row.index,
              next === NONE_CATEGORY_VALUE ? null : next,
            );
          }}
        >
          <SelectTrigger className="w-full max-w-[220px]" size="sm">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_CATEGORY_VALUE}>None</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  };
}

function createAddCategoryColumn(
  onCreateCategory: (description: string) => void,
): ColumnDef<PreviewRow> {
  return {
    id: "add-category",
    header: () => <span className="sr-only">New category</span>,
    cell: ({ row }) => {
      const description = row.original.description.trim();

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => onCreateCategory(description)}
              disabled={!description}
              aria-label="Create category from description"
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create category</TooltipContent>
        </Tooltip>
      );
    },
    meta: {
      headerClassName: "w-12",
      cellClassName: "w-12",
    },
  };
}

const balanceColumn: ColumnDef<PreviewRow> = {
  accessorKey: "balance",
  header: () => <div className="text-right">Balance</div>,
  cell: ({ row }) => (
    <div className="text-right tabular-nums">
      {formatDisplayNumber(row.getValue("balance"))}
    </div>
  ),
};

function getBaseColumns(
  categories: ImportCategoryOption[],
  onCategoryChange: (rowIndex: number, categoryId: string | null) => void,
  onCreateCategory: (description: string) => void,
): ColumnDef<PreviewRow>[] {
  return [
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
    createCategoryColumn(categories, onCategoryChange),
    createAddCategoryColumn(onCreateCategory),
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
}

export function getPreviewColumns(
  includeBalance: boolean,
  categories: ImportCategoryOption[],
  onCategoryChange: (rowIndex: number, categoryId: string | null) => void,
  onCreateCategory: (description: string) => void,
): ColumnDef<PreviewRow>[] {
  const columns = getBaseColumns(
    categories,
    onCategoryChange,
    onCreateCategory,
  );

  if (includeBalance) {
    return [...columns, balanceColumn];
  }

  return columns;
}
