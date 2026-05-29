DELETE FROM "transaction";--> statement-breakpoint
DELETE FROM "import";--> statement-breakpoint
ALTER TABLE "import" ADD COLUMN "merchant" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "merchant" text NOT NULL;