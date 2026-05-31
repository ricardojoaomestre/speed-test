import { desc, eq } from 'drizzle-orm';

import { TransactionsTable } from '@/app/(protected)/transactions/components/transactions-table';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { db } from '@/db';
import { categories, transactions } from '@/db/schema';
import { getCategories } from '@/lib/categories/get-categories';

export default async function TransactionsPage() {
  const [rows, categoryRows] = await Promise.all([
    db
      .select({
        id: transactions.id,
        date: transactions.date,
        description: transactions.description,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        value: transactions.value,
        importId: transactions.importId,
        merchant: transactions.merchant,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .orderBy(desc(transactions.date)),
    getCategories(),
  ]);

  const categoryOptions = categoryRows.map(({ id, name }) => ({ id, name }));

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
        <TransactionsTable data={rows} categories={categoryOptions} />
      )}
    </div>
  );
}
