import { desc, eq } from 'drizzle-orm';

import { TransactionsTable } from '@/app/(protected)/transactions/components/transactions-table';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { db } from '@/db';
import { categories, imports, transactions } from '@/db/schema';

export default async function TransactionsPage() {
  const rows = await db
    .select({
      id: transactions.id,
      date: transactions.date,
      description: transactions.description,
      categoryName: categories.name,
      value: transactions.value,
      importId: transactions.importId,
      importFilename: imports.filename,
      merchant: transactions.merchant,
    })
    .from(transactions)
    .innerJoin(imports, eq(transactions.importId, imports.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date));

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          All transactions from every import
        </p>
      </div>
      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No transactions yet</EmptyTitle>
            <EmptyDescription>
              Import a file from the dashboard.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <TransactionsTable data={rows} />
      )}
    </div>
  );
}
