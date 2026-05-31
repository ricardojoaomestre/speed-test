ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "description" text;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "color" text;--> statement-breakpoint
UPDATE "category"
SET "color" = (
  ARRAY[
    'red-200', 'orange-200', 'amber-200', 'yellow-200', 'lime-200',
    'green-200', 'emerald-200', 'teal-200', 'cyan-200', 'sky-200',
    'blue-200', 'indigo-200', 'violet-200', 'purple-200', 'fuchsia-200',
    'pink-200', 'rose-200', 'red-300', 'orange-300', 'amber-300',
    'green-300', 'teal-300', 'cyan-300', 'blue-300', 'indigo-300',
    'violet-300', 'purple-300', 'pink-300', 'rose-300', 'sky-300'
  ]
)[1 + (abs(hashtext("id")) % 30)]
WHERE "color" IS NULL;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "color" SET NOT NULL;
