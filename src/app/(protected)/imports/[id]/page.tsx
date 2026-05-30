import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ImportTransactionsTable } from '@/app/(protected)/imports/[id]/components/import-transactions-table';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from '@/components/ui/empty';
import { db } from '@/db';
import { categories, imports, transactions, users } from '@/db/schema';
import { formatDisplayDate, formatImportStatus } from '@/lib/formatters';
import { getMerchantLabelOrSlug } from '@/lib/merchants';
import { importStatusBadgeVariant } from '@/lib/status-badge';

type ImportDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ImportDetailPage({ params }: ImportDetailPageProps) {
  const { id } = await params;

  const [importRecord] = await db
    .select({
      id: imports.id,
      filename: imports.filename,
      importedAt: imports.importedAt,
      rowCount: imports.rowCount,
      status: imports.status,
      merchant: imports.merchant,
      importerName: users.name,
      importerEmail: users.email,
    })
    .from(imports)
    .innerJoin(users, eq(imports.userId, users.id))
    .where(eq(imports.id, id))
    .limit(1);

  if (!importRecord) {
    notFound();
  }

  const importTransactions = await db
    .select({
      id: transactions.id,
      date: transactions.date,
      description: transactions.description,
      categoryName: categories.name,
      value: transactions.value,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.importId, id))
    .orderBy(desc(transactions.date));

  const importedBy =
    importRecord.importerName ?? importRecord.importerEmail ?? 'Unknown';

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/transactions"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to transactions
        </Link>
        <h1 className="text-2xl font-semibold">{importRecord.filename}</h1>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Imported at</dt>
          <dd className="font-medium">
            {formatDisplayDate(importRecord.importedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Rows imported</dt>
          <dd className="font-medium">{importRecord.rowCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <Badge variant={importStatusBadgeVariant(importRecord.status)}>
              {formatImportStatus(importRecord.status)}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Merchant</dt>
          <dd className="font-medium">
            {getMerchantLabelOrSlug(importRecord.merchant)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Imported by</dt>
          <dd className="font-medium">{importedBy}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Transactions</h2>
        {importTransactions.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyDescription>
                No transactions in this import.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ImportTransactionsTable data={importTransactions} />
        )}
      </div>
    </div>
  );
}
