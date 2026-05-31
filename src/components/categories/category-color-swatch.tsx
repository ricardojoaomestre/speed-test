import {
  getCategorySwatchClasses,
  isCategoryColorToken,
  type CategoryColorToken,
} from '@/lib/categories/category-colors';
import { cn } from '@/lib/utils';

type CategoryColorSwatchProps = {
  color: string;
  className?: string;
  label?: string;
};

export function CategoryColorSwatch({
  color,
  className,
  label,
}: CategoryColorSwatchProps) {
  const token: CategoryColorToken = isCategoryColorToken(color)
    ? color
    : 'sky-200';

  return (
    <span
      className={cn(
        'inline-block size-5 shrink-0 rounded-full border border-border/60',
        getCategorySwatchClasses(token),
        className,
      )}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      title={label}
    />
  );
}
