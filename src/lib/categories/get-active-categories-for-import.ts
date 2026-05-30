import { asc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { categories } from '@/db/schema';

export type ImportCategoryOption = {
  id: string;
  name: string;
};

export type ImportCategoryRule = ImportCategoryOption & {
  pattern: string;
};

export async function getActiveCategoriesForImport(): Promise<
  ImportCategoryRule[]
> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      pattern: categories.pattern,
    })
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.priority));
}
