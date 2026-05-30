'use client';

import { useState, useTransition } from 'react';

import type { CategoryFormInput } from '@/app/(protected)/settings/categories/actions/category-actions';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CategoryRow } from '@/lib/categories/get-categories';

type CategoryFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryRow | null;
  onSubmit: (input: CategoryFormInput) => Promise<{
    ok: boolean;
    error?: string;
    fieldErrors?: Partial<Record<'name' | 'pattern', string>>;
  }>;
};

type CategoryFormBodyProps = {
  category: CategoryRow | null;
  onSubmit: CategoryFormSheetProps['onSubmit'];
  onCancel: () => void;
};

function CategoryFormBody({
  category,
  onSubmit,
  onCancel,
}: CategoryFormBodyProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? '');
  const [pattern, setPattern] = useState(category?.pattern ?? '');
  const [active, setActive] = useState(category?.active ?? true);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'name' | 'pattern', string>>
  >({});

  const isEditing = category !== null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await onSubmit({ name, pattern, active });

      if (!result.ok) {
        setFormError(result.error ?? 'Something went wrong.');
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-1">
      <FieldGroup>
        <Field data-invalid={Boolean(fieldErrors.name)}>
          <FieldLabel htmlFor="category-name">Name</FieldLabel>
          <FieldContent>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Groceries"
              aria-invalid={Boolean(fieldErrors.name)}
              disabled={isPending}
              autoComplete="off"
            />
            <FieldError>{fieldErrors.name}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.pattern)}>
          <FieldLabel htmlFor="category-pattern">Pattern</FieldLabel>
          <FieldContent>
            <Textarea
              id="category-pattern"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              placeholder="continente|pingo\\s+doce"
              aria-invalid={Boolean(fieldErrors.pattern)}
              disabled={isPending}
              rows={4}
              className="font-mono text-sm"
            />
            <FieldDescription>
              Regular expression matched against transaction descriptions
              (case-insensitive).
            </FieldDescription>
            <FieldError>{fieldErrors.pattern}</FieldError>
          </FieldContent>
        </Field>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="category-active">Active</FieldLabel>
            <FieldDescription>
              Inactive categories are skipped during import.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="category-active"
            checked={active}
            onCheckedChange={setActive}
            disabled={isPending}
          />
        </Field>
      </FieldGroup>

      {formError && !Object.keys(fieldErrors).length ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <SheetFooter className="flex-row justify-end gap-2 px-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create'}
        </Button>
      </SheetFooter>
    </form>
  );
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  category,
  onSubmit,
}: CategoryFormSheetProps) {
  const isEditing = category !== null;
  const formKey = category?.id ?? 'new';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit category' : 'New category'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the name, pattern, or status for this category.'
              : 'Create a rule to categorize matching transactions at import time.'}
          </SheetDescription>
        </SheetHeader>

        {open ? (
          <CategoryFormBody
            key={formKey}
            category={category}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
