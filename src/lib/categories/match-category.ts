export type CategoryRule = {
  id: string;
  pattern: string;
};

export function matchCategoryId(
  description: string,
  rules: CategoryRule[],
): string | null {
  for (const rule of rules) {
    try {
      const regex = new RegExp(rule.pattern, 'i');

      if (regex.test(description)) {
        return rule.id;
      }
    } catch {
      continue;
    }
  }

  return null;
}
