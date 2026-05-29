'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { ImportDataTable } from '@/app/(protected)/dashboard/components/import-data-table';
import { formatDisplayDate, formatDisplayNumber } from '@/lib/formatters';

export type ImportTransactionRow = {
  id: string;
  date: Date;
  description: string;
  category: string | null;
  value: string;
};

const columns: ColumnDef<ImportTransactionRow>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => formatDisplayDate(row.original.date),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <span className="whitespace-normal">{row.getValue('description')}</span>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => row.original.category ?? '—',
  },
  {
    accessorKey: 'value',
    header: () => <div className="text-right">Value</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatDisplayNumber(row.getValue('value'))}
      </div>
    ),
  },
];

type ImportTransactionsTableProps = {
  data: ImportTransactionRow[];
};

export function ImportTransactionsTable({ data }: ImportTransactionsTableProps) {
  return <ImportDataTable columns={columns} data={data} />;
}
