import { asc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { categories } from '@/db/schema';

export async function getActiveCategoriesForImport() {
  return db
    .select({
      id: categories.id,
      pattern: categories.pattern,
    })
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.priority));
}
