import { Badge } from '@/components/ui/badge';
import {
  getCategoryPillClasses,
  isCategoryColorToken,
  type CategoryColorToken,
} from '@/lib/categories/category-colors';
import { cn } from '@/lib/utils';

type CategoryPillProps = {
  name: string;
  color: string;
  className?: string;
};

export function CategoryPill({ name, color, className }: CategoryPillProps) {
  const token: CategoryColorToken = isCategoryColorToken(color)
    ? color
    : 'sky-200';

  return (
    <Badge
      variant="outline"
      className={cn(
        'max-w-[12rem] border-transparent',
        isCategoryColorToken(color)
          ? getCategoryPillClasses(token)
          : 'bg-muted text-muted-foreground',
        className,
      )}
      title={name}
    >
      <span className="truncate">{name}</span>
    </Badge>
  );
}
