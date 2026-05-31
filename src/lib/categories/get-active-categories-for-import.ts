import { asc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { categories } from '@/db/schema';
import {
  getDefaultCategoryColor,
  isCategoryColorToken,
  type CategoryColorToken,
} from '@/lib/categories/category-colors';

export type ImportCategoryOption = {
  id: string;
  name: string;
  color: CategoryColorToken;
};

export type ImportCategoryRule = ImportCategoryOption & {
  pattern: string | null;
};

export async function getActiveCategoriesForImport(): Promise<
  ImportCategoryRule[]
> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      pattern: categories.pattern,
    })
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.priority))
    .then((rows) =>
      rows.map((row) => ({
        ...row,
        color: isCategoryColorToken(row.color)
          ? row.color
          : getDefaultCategoryColor(row.id),
      })),
    );
}
