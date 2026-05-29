import { ImportJobsTable } from '@/app/(protected)/imports/components/import-jobs-table';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { getImports } from '@/lib/imports/get-imports';

export default async function ImportJobsPage() {
  const importJobs = await getImports();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Import jobs</h1>
        <p className="text-sm text-muted-foreground">
          All spreadsheet imports
        </p>
      </div>
      {importJobs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No imports yet</EmptyTitle>
            <EmptyDescription>
              Import a file from the dashboard.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ImportJobsTable data={importJobs} />
      )}
    </div>
  );
}
