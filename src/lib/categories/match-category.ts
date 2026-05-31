export type CategoryRule = {
  id: string;
  pattern: string | null;
};

export function matchCategoryId(
  description: string,
  rules: CategoryRule[],
): string | null {
  for (const rule of rules) {
    const pattern = rule.pattern?.trim();

    if (!pattern) {
      continue;
    }

    try {
      const regex = new RegExp(pattern, 'i');

      if (regex.test(description)) {
        return rule.id;
      }
    } catch {
      continue;
    }
  }

  return null;
}
