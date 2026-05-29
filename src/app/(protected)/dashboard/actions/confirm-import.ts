'use server';

import { eq } from 'drizzle-orm';

import { auth } from '@/auth';
import { db } from '@/db';
import { imports, type ImportStatus, transactions } from '@/db/schema';
import { formatDbError } from '@/lib/db/format-db-error';
import {
  isValidImportRow,
  type ImportedSpreadsheetRow,
} from '@/lib/file-import';

export type ConfirmImportInput = {
  filename: string;
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

function formatTransactionValue(value: number): string {
  return value.toFixed(2);
}

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

  const validRows = input.rows.filter(isValidImportRow);

  if (validRows.length === 0) {
    return {
      ok: false,
      error: 'No valid rows to import. Fix validation errors and try again.',
    };
  }

  const skippedCount = input.rows.length - validRows.length;
  const status: ImportStatus =
    skippedCount === 0 ? 'completed' : 'partial';

  const importId = crypto.randomUUID();

  try {
    await db.insert(imports).values({
      id: importId,
      filename,
      rowCount: validRows.length,
      userId: session.user.id,
      status,
    });

    await db.insert(transactions).values(
      validRows.map((row) => ({
        date: new Date(row.date!),
        description: row.description.trim(),
        category: null,
        value: formatTransactionValue(row.value!),
        importId,
      })),
    );
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
    importedCount: validRows.length,
    skippedCount,
  };
}
