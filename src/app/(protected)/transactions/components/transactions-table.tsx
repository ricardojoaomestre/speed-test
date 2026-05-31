'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';

import { ImportDataTable } from '@/app/(protected)/dashboard/components/import-data-table';
import { CategoryPill } from '@/components/categories/category-pill';
import { DataTableRowActions } from '@/components/data-table/row-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    meta: {
      headerClassName: 'w-12',
      cellClassName: 'w-12',
    },
    cell: ({ row }) => (
      <DataTableRowActions>
        <DropdownMenuItem asChild>
          <Link href={`/imports/${row.original.importId}`}>View import</Link>
        </DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
];

type TransactionsTableProps = {
  data: TransactionRow[];
};

export function TransactionsTable({ data }: TransactionsTableProps) {
  return <ImportDataTable columns={columns} data={data} />;
}
