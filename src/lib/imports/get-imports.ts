import { desc } from 'drizzle-orm';

import { db } from '@/db';
import { imports, type ImportStatus } from '@/db/schema';

export type ImportJobRow = {
  id: string;
  filename: string;
  importedAt: Date;
  rowCount: number;
  status: ImportStatus;
};

export async function getImports(limit?: number): Promise<ImportJobRow[]> {
  const query = db
    .select({
      id: imports.id,
      filename: imports.filename,
      importedAt: imports.importedAt,
      rowCount: imports.rowCount,
      status: imports.status,
    })
    .from(imports)
    .orderBy(desc(imports.importedAt));

  if (limit !== undefined) {
    return query.limit(limit);
  }

  return query;
}
