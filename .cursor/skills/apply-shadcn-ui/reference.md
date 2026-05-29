# shadcn/ui audit reference

## Grep patterns

Search `src/**/*.tsx` for candidates:

```bash
# Badge-like pills
rg 'rounded-full.*px-2|inline-flex.*rounded-full' src --glob '*.tsx'

# Custom alerts
rg 'role="alert"|border-destructive' src --glob '*.tsx'

# Inline destructive text (prefer FieldError in forms)
rg 'text-destructive' src --glob '*.tsx'

# Empty / placeholder copy
rg 'No (results|transactions|items)' src --glob '*.tsx'

# Modal-like overlays
rg 'fixed inset-0|role="dialog"' src --glob '*.tsx' -i
```

## Catalog

Full list: https://ui.shadcn.com/docs/components/

Registry extras: https://ui.shadcn.com/docs/directory

## Project aliases

From `components.json`:

- UI: `@/components/ui`
- Utils: `@/lib/utils`

## Installed components (update after `shadcn add`)

`alert`, `badge`, `button`, `empty`, `field`, `input`, `label`, `separator`, `table`, `tooltip`
