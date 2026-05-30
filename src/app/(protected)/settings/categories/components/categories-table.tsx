'use client';

import { PencilIcon } from 'lucide-react';

import { ImportDataTable } from '@/app/(protected)/dashboard/components/import-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { CategoryRow } from '@/lib/categories/get-categories';
import type { ColumnDef } from '@tanstack/react-table';

type CategoriesTableProps = {
  categories: CategoryRow[];
  disabled?: boolean;
  onEdit: (category: CategoryRow) => void;
  onToggleActive: (id: string, active: boolean) => void;
};

export function CategoriesTable({
  categories,
  disabled = false,
  onEdit,
  onToggleActive,
}: CategoriesTableProps) {
  const columns: ColumnDef<CategoryRow>[] = [
    {
      accessorKey: 'priority',
      header: '#',
      meta: {
        headerClassName: 'w-12',
        cellClassName: 'w-12',
      },
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      meta: {
        headerClassName: 'w-[20%]',
        cellClassName: 'w-[20%]',
      },
      cell: ({ row }) => (
        <span className="block truncate font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'pattern',
      header: 'Pattern',
      meta: {
        headerClassName: 'max-w-xs',
        cellClassName: 'max-w-xs overflow-hidden',
      },
      cell: ({ row }) => (
        <code
          className="block truncate text-xs text-muted-foreground"
          title={row.original.pattern}
        >
          {row.original.pattern}
        </code>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      meta: {
        headerClassName: 'w-28',
        cellClassName: 'w-28',
      },
      cell: ({ row }) =>
        row.original.active ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      id: 'toggle',
      header: 'Active',
      meta: {
        headerClassName: 'w-20',
        cellClassName: 'w-20',
      },
      cell: ({ row }) => (
        <Switch
          checked={row.original.active}
          disabled={disabled}
          aria-label={`Toggle ${row.original.name}`}
          onCheckedChange={(checked) =>
            onToggleActive(row.original.id, checked)
          }
        />
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      meta: {
        headerClassName: 'w-24',
        cellClassName: 'w-24',
      },
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(row.original)}
        >
          <PencilIcon />
          Edit
        </Button>
      ),
    },
  ];

  return (
    <ImportDataTable
      columns={columns}
      data={categories}
      tableClassName="table-fixed"
    />
  );
}
