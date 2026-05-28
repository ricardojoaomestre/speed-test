import parseDecimalNumber from "parse-decimal-number";

const EU_NUMBER_OPTIONS = { thousands: ".", decimal: "," } as const;

const parseEuDecimal = parseDecimalNumber.withOptions(EU_NUMBER_OPTIONS);

export function parseLocalizedNumber(raw: string): number | null {
  let normalized = raw.trim();
  if (!normalized) return null;

  if (normalized.startsWith("(") && normalized.endsWith(")")) {
    normalized = `-${normalized.slice(1, -1).trim()}`;
  }

  normalized = normalized.replace(/[€$£¥%\s]/g, "");

  const parsed = parseEuDecimal(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
