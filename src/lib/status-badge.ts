import type { badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

import type { ImportStatus } from '@/db/schema';

export type StatusBadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>['variant']
>;

export function importStatusBadgeVariant(
  status: ImportStatus | string,
): StatusBadgeVariant {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'destructive';
    case 'partial':
      return 'warning';
    default:
      return 'warning';
  }
}
