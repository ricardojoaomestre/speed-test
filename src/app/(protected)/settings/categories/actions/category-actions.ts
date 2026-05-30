'use server';

import { eq, max } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { formatDbError } from '@/lib/db/format-db-error';
import {
  validateCategoryName,
  validateCategoryPattern,
} from '@/lib/categories/validate-category';

type ActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<'name' | 'pattern', string>>;
    };

export type CategoryFormInput = {
  name: string;
  pattern: string;
  active: boolean;
};

function getFieldErrors(input: CategoryFormInput) {
  const fieldErrors: Partial<Record<'name' | 'pattern', string>> = {};
  const nameError = validateCategoryName(input.name);
  const patternError = validateCategoryPattern(input.pattern);

  if (nameError) {
    fieldErrors.name = nameError;
  }

  if (patternError) {
    fieldErrors.pattern = patternError;
  }

  return fieldErrors;
}

async function requireSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function getNextPriority(): Promise<number> {
  const [result] = await db
    .select({ value: max(categories.priority) })
    .from(categories);

  return (result?.value ?? 0) + 1;
}

function getPostgresError(error: unknown): { code?: string; constraint?: string } | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const record = error as { code?: string; constraint?: string; cause?: unknown };

  if (record.code) {
    return record;
  }

  if (record.cause && typeof record.cause === 'object') {
    return getPostgresError(record.cause);
  }

  return null;
}

function formatUniqueNameError(error: unknown): ActionResult | null {
  const pg = getPostgresError(error);

  if (pg?.code === '23505' && pg.constraint?.includes('name')) {
    return {
      ok: false,
      error: 'A category with this name already exists.',
      fieldErrors: { name: 'A category with this name already exists.' },
    };
  }

  return null;
}

export async function createCategory(
  input: CategoryFormInput,
): Promise<ActionResult> {
  const userId = await requireSessionUserId();

  if (!userId) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const fieldErrors = getFieldErrors(input);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: 'Fix the highlighted fields.',
      fieldErrors,
    };
  }

  try {
    await db.insert(categories).values({
      name: input.name.trim(),
      pattern: input.pattern.trim(),
      active: input.active,
      priority: await getNextPriority(),
      updatedAt: new Date(),
    });
  } catch (error) {
    const uniqueError = formatUniqueNameError(error);

    if (uniqueError) {
      return uniqueError;
    }

    console.error('[createCategory]', error);

    return {
      ok: false,
      error: formatDbError(error, 'Could not create category'),
    };
  }

  revalidatePath('/settings/categories');
  return { ok: true };
}

export async function updateCategory(
  id: string,
  input: CategoryFormInput,
): Promise<ActionResult> {
  const userId = await requireSessionUserId();

  if (!userId) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const fieldErrors = getFieldErrors(input);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: 'Fix the highlighted fields.',
      fieldErrors,
    };
  }

  try {
    const [updated] = await db
      .update(categories)
      .set({
        name: input.name.trim(),
        pattern: input.pattern.trim(),
        active: input.active,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    if (!updated) {
      return { ok: false, error: 'Category not found.' };
    }
  } catch (error) {
    const uniqueError = formatUniqueNameError(error);

    if (uniqueError) {
      return uniqueError;
    }

    console.error('[updateCategory]', error);

    return {
      ok: false,
      error: formatDbError(error, 'Could not update category'),
    };
  }

  revalidatePath('/settings/categories');
  return { ok: true };
}

export async function setCategoryActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const userId = await requireSessionUserId();

  if (!userId) {
    return { ok: false, error: 'You must be signed in.' };
  }

  try {
    const [updated] = await db
      .update(categories)
      .set({ active, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    if (!updated) {
      return { ok: false, error: 'Category not found.' };
    }
  } catch (error) {
    console.error('[setCategoryActive]', error);

    return {
      ok: false,
      error: formatDbError(error, 'Could not update category status'),
    };
  }

  revalidatePath('/settings/categories');
  return { ok: true };
}

export async function reorderCategories(
  orderedIds: string[],
): Promise<ActionResult> {
  const userId = await requireSessionUserId();

  if (!userId) {
    return { ok: false, error: 'You must be signed in.' };
  }

  if (orderedIds.length === 0) {
    return { ok: true };
  }

  const uniqueIds = new Set(orderedIds);

  if (uniqueIds.size !== orderedIds.length) {
    return { ok: false, error: 'Invalid category order.' };
  }

  try {
    const existing = await db
      .select({ id: categories.id })
      .from(categories);

    if (existing.length !== orderedIds.length) {
      return {
        ok: false,
        error: 'Category list is out of date. Refresh and try again.',
      };
    }

    const existingIds = new Set(existing.map((row) => row.id));

    if (!orderedIds.every((id) => existingIds.has(id))) {
      return { ok: false, error: 'Invalid category order.' };
    }

    const now = new Date();

    await db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(categories)
          .set({ priority: index + 1, updatedAt: now })
          .where(eq(categories.id, id));
      }
    });
  } catch (error) {
    console.error('[reorderCategories]', error);

    return {
      ok: false,
      error: formatDbError(error, 'Could not update category order'),
    };
  }

  revalidatePath('/settings/categories');
  return { ok: true };
}
