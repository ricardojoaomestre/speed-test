'use server';

import { eq } from 'drizzle-orm';

import { auth } from '@/auth';
import { db } from '@/db';
import { imports, type ImportStatus, transactions } from '@/db/schema';
import { formatDbError } from '@/lib/db/format-db-error';
import { getActiveCategoriesForImport } from '@/lib/categories/get-active-categories-for-import';
import { matchCategoryId } from '@/lib/categories/match-category';
import {
  classifyImportRows,
  formatTransactionValueForKey,
  isImportableRow,
  type ImportedSpreadsheetRow,
} from '@/lib/file-import';
import { getExistingDuplicateKeys } from '@/lib/file-import/get-existing-duplicate-keys';
import { isMerchantSlug, type MerchantSlug } from '@/lib/merchants';

export type ConfirmImportInput = {
  filename: string;
  merchant: MerchantSlug;
  rows: ImportedSpreadsheetRow[];
};

export type ConfirmImportResult =
  | {
      ok: true;
      importId: string;
      status: ImportStatus;
      importedCount: number;
      skippedCount: number;
    }
  | { ok: false; error: string };

export async function confirmImport(
  input: ConfirmImportInput,
): Promise<ConfirmImportResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, error: 'You must be signed in to import data.' };
  }

  const filename = input.filename?.trim();
  if (!filename) {
    return { ok: false, error: 'Filename is required.' };
  }

  if (!Array.isArray(input.rows) || input.rows.length === 0) {
    return { ok: false, error: 'No rows to import.' };
  }

  if (!isMerchantSlug(input.merchant)) {
    return { ok: false, error: 'A valid merchant is required.' };
  }

  const merchant = input.merchant;
  const existingKeys = await getExistingDuplicateKeys(merchant);
  const classifiedRows = classifyImportRows(input.rows, existingKeys, merchant);
  const importableRows = classifiedRows.filter(isImportableRow);

  const skippedCount = input.rows.length - importableRows.length;
  const status: ImportStatus =
    skippedCount === 0 ? 'completed' : 'partial';

  const importId = crypto.randomUUID();
  const categoryRules = await getActiveCategoriesForImport();

  try {
    await db.insert(imports).values({
      id: importId,
      filename,
      rowCount: importableRows.length,
      userId: session.user.id,
      status,
      merchant,
    });

    if (importableRows.length > 0) {
      await db.insert(transactions).values(
        importableRows.map(({ row }) => {
          const description = row.description.trim();

          return {
            date: new Date(row.date!),
            description,
            categoryId: matchCategoryId(description, categoryRules),
            value: formatTransactionValueForKey(row.value!),
            importId,
            merchant,
          };
        }),
      );
    }
  } catch (error) {
    try {
      await db.delete(imports).where(eq(imports.id, importId));
    } catch {
      // Best-effort rollback if import row was created before transactions failed.
    }

    console.error('[confirmImport]', error);

    return {
      ok: false,
      error: formatDbError(error, 'Could not save import'),
    };
  }

  return {
    ok: true,
    importId,
    status,
    importedCount: importableRows.length,
    skippedCount,
  };
}
