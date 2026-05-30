export function validateCategoryPattern(pattern: string): string | null {
  const trimmed = pattern.trim();

  if (!trimmed) {
    return 'Pattern is required.';
  }

  try {
    new RegExp(trimmed, 'i');
    return null;
  } catch {
    return 'Invalid regular expression.';
  }
}

export function validateCategoryName(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Name is required.';
  }

  if (trimmed.length > 100) {
    return 'Name must be 100 characters or fewer.';
  }

  return null;
}
