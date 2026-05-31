'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { ImportDataTable } from '@/app/(protected)/dashboard/components/import-data-table';
import { TransactionsTableFilters } from '@/app/(protected)/transactions/components/transactions-table-filters';
import {
  DEFAULT_TRANSACTION_FILTERS,
  filterTransactions,
  hasActiveTransactionFilters,
} from '@/app/(protected)/transactions/lib/filter-transactions';
import { CategoryPill } from '@/components/categories/category-pill';
import {
  TABLE_MONEY_CELL_CLASS,
  TableMoneyCell,
} from '@/components/data-table/table-money-cell';
import { DataTableRowActions } from '@/components/data-table/row-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { formatDisplayDate } from '@/lib/formatters';
import { getMerchantLabelOrSlug } from '@/lib/merchants';

export type TransactionRow = {
  id: string;
  date: Date;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  value: string;
  importId: string;
  merchant: string;
};

type CategoryFilterOption = {
  id: string;
  name: string;
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
    header: () => <div className={TABLE_MONEY_CELL_CLASS}>Value</div>,
    cell: ({ row }) => <TableMoneyCell value={row.getValue('value')} />,
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
  categories: CategoryFilterOption[];
};

export function TransactionsTable({ data, categories }: TransactionsTableProps) {
  const [filters, setFilters] = useState(DEFAULT_TRANSACTION_FILTERS);
  const filteredData = useMemo(
    () => filterTransactions(data, filters),
    [data, filters],
  );

  return (
    <div className="flex flex-col gap-4">
      <TransactionsTableFilters
        filters={filters}
        categories={categories}
        onFiltersChange={setFilters}
        onClear={() => setFilters(DEFAULT_TRANSACTION_FILTERS)}
        showClear={hasActiveTransactionFilters(filters)}
      />
      <ImportDataTable columns={columns} data={filteredData} />
    </div>
  );
}
