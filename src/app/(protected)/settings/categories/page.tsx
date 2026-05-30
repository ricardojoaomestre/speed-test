import { CategoriesManager } from '@/app/(protected)/settings/categories/components/categories-manager';
import { getCategories } from '@/lib/categories/get-categories';

export default async function CategoriesSettingsPage() {
  const categories = await getCategories();

  return <CategoriesManager categories={categories} />;
}
