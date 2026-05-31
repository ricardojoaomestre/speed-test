'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';

import { ImportDataTable } from '@/app/(protected)/dashboard/components/import-data-table';
import { CategoryPill } from '@/components/categories/category-pill';
import { formatDisplayDate, formatDisplayNumber } from '@/lib/formatters';
import { getMerchantLabelOrSlug } from '@/lib/merchants';

export type TransactionRow = {
  id: string;
  date: Date;
  description: string;
  categoryName: string | null;
  categoryColor: string | null;
  value: string;
  importId: string;
  importFilename: string;
  merchant: string;
};

const columns: ColumnDef<TransactionRow>[] = [
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
    accessorKey: 'categoryName',
    header: 'Category',
    cell: ({ row }) => {
      const { categoryName, categoryColor } = row.original;

      if (!categoryName || !categoryColor) {
        return '—';
      }

      return <CategoryPill name={categoryName} color={categoryColor} />;
    },
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
  {
    accessorKey: 'merchant',
    header: 'Merchant',
    cell: ({ row }) => getMerchantLabelOrSlug(row.original.merchant),
  },
  {
    id: 'import',
    header: 'Import',
    cell: ({ row }) => (
      <Link
        href={`/imports/${row.original.importId}`}
        className="text-primary underline-offset-4 hover:underline"
      >
        {row.original.importFilename}
      </Link>
    ),
  },
];

type TransactionsTableProps = {
  data: TransactionRow[];
};

export function TransactionsTable({ data }: TransactionsTableProps) {
  return <ImportDataTable columns={columns} data={data} />;
}
