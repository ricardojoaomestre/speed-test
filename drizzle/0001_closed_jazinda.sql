CREATE TABLE "import" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"importedAt" timestamp DEFAULT now() NOT NULL,
	"rowCount" integer NOT NULL,
	"userId" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"importId" text NOT NULL,
	"date" timestamp NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"value" numeric(14, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "import" ADD CONSTRAINT "import_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_importId_import_id_fk" FOREIGN KEY ("importId") REFERENCES "public"."import"("id") ON DELETE cascade ON UPDATE no action;