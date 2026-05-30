import { asc } from 'drizzle-orm';

import { db } from '@/db';
import { categories } from '@/db/schema';

export type CategoryRow = {
  id: string;
  name: string;
  pattern: string;
  priority: number;
  active: boolean;
};

export async function getCategories(): Promise<CategoryRow[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      pattern: categories.pattern,
      priority: categories.priority,
      active: categories.active,
    })
    .from(categories)
    .orderBy(asc(categories.priority));
}
