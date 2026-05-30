'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  createCategory,
  setCategoryActive,
  updateCategory,
  type CategoryFormInput,
} from '@/app/(protected)/settings/categories/actions/category-actions';
import { Button } from '@/components/ui/button';
import type { CategoryRow } from '@/lib/categories/get-categories';

import { CategoryFormSheet } from './category-form-sheet';
import { CategoriesTable } from './categories-table';

type CategoriesManagerProps = {
  categories: CategoryRow[];
};

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(
    null,
  );
  const [toggleError, setToggleError] = useState<string | null>(null);

  function openCreate() {
    setEditingCategory(null);
    setSheetOpen(true);
  }

  function openEdit(category: CategoryRow) {
    setEditingCategory(category);
    setSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    setSheetOpen(open);

    if (!open) {
      setEditingCategory(null);
    }
  }

  async function handleSubmit(input: CategoryFormInput) {
    const result = editingCategory
      ? await updateCategory(editingCategory.id, input)
      : await createCategory(input);

    if (result.ok) {
      setSheetOpen(false);
      setEditingCategory(null);
      startTransition(() => {
        router.refresh();
      });
    }

    return result;
  }

  async function handleToggleActive(id: string, active: boolean) {
    setToggleError(null);

    const result = await setCategoryActive(id, active);

    if (!result.ok) {
      setToggleError(result.error);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">
            Rules for auto-categorizing transactions at import time. First
            match wins by priority order.
          </p>
        </div>
        <Button onClick={openCreate}>New category</Button>
      </div>

      {toggleError ? (
        <p className="text-sm text-destructive" role="alert">
          {toggleError}
        </p>
      ) : null}

      <CategoriesTable
        categories={categories}
        disabled={isPending}
        onEdit={openEdit}
        onToggleActive={handleToggleActive}
      />

      <CategoryFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        category={editingCategory}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
