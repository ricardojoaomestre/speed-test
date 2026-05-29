---
name: apply-shadcn-ui
description: Audits and refactors custom UI to use shadcn/ui components per project rules. Use when applying shadcn rules, replacing styled spans or divs with primitives, auditing UI for shadcn opportunities, or after adding new screens or forms.
---

# Apply shadcn/ui

Project rule (always on): `.cursor/rules/shadcn-ui.mdc`. This skill adds an **audit-and-fix workflow** when explicitly asked to apply or enforce it.

## Workflow

1. **List installed components** — `src/components/ui/` (do not duplicate).
2. **Scan for replacements** — Patterns in [reference.md](reference.md).
3. **Map each hit** — Catalog component → install if missing → refactor.
4. **Install missing components**:

   ```bash
   npx shadcn@latest add <component> --yes
   ```

5. **Refactor** — Import from `@/components/ui/<name>`. Keep domain components (`FileImport`, `*Table`) but compose shadcn inside them.
6. **Update the rule file** — Add new component names to the "Already installed" list in `.cursor/rules/shadcn-ui.mdc`.
7. **Verify** — `npm run build`.

## Replacement quick reference

| Pattern | Use |
|---------|-----|
| `rounded-full px-2` status pills | `Badge` |
| `role="alert"` + destructive border box | `Alert`, `AlertTitle`, `AlertDescription` |
| Field validation `<p className="text-destructive">` | `FieldError` (inside `Field`) |
| Empty list / "No results" copy | `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription` |
| Hand-styled `<table>` | `Table` (+ Data Table pattern if needed) |
| Custom modal overlay | `Dialog`, `Sheet`, or `Alert Dialog` |

## Do not replace

- `whitespace-normal` on table cell text (layout only).
- Semantic markup (`<dl>`, `<nav>` with `Link`) unless a shadcn pattern clearly fits.
- Domain wrappers that already compose shadcn (`ImportDataTable`, etc.).

## Additional resources

- Scan patterns and grep hints: [reference.md](reference.md)
