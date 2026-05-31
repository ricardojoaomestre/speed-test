UPDATE "category" SET "pattern" = NULL WHERE trim("pattern") = '';--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "pattern" DROP NOT NULL;
