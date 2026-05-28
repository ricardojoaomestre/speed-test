'use client';

import type { ColumnDef } from '@tanstack/react-table';

import type { ImportedSpreadsheetRow } from '@/app/(protected)/dashboard/actions/import-file';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});

const numberFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
};

const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '—';
  return numberFormatter.format(value);
};

const balanceColumn: ColumnDef<ImportedSpreadsheetRow> = {
  accessorKey: 'balance',
  header: () => <div className="text-right">Balance</div>,
  cell: ({ row }) => (
    <div className="text-right tabular-nums">
      {formatNumber(row.getValue('balance'))}
    </div>
  ),
};

export const importColumns: ColumnDef<ImportedSpreadsheetRow>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('date')),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <span className="whitespace-normal">{row.getValue('description')}</span>
    ),
  },
  {
    accessorKey: 'value',
    header: () => <div className="text-right">Value</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatNumber(row.getValue('value'))}
      </div>
    ),
  },
];

export const importColumnsWithBalance: ColumnDef<ImportedSpreadsheetRow>[] = [
  ...importColumns,
  balanceColumn,
];
