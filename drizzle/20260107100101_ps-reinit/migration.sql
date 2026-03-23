CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE TABLE "archives" (
	"archive" json NOT NULL,
	"sha256" char(64) PRIMARY KEY GENERATED ALWAYS AS (encode(digest("archives"."archive"::text, 'sha256'), 'hex')) STORED NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"name" varchar NOT NULL,
	"pname" varchar GENERATED ALWAYS AS ("packages"."nix"->>'pname') STORED NOT NULL,
	"version" varchar GENERATED ALWAYS AS ("packages"."nix"->>'version') STORED NOT NULL,
	"description" varchar GENERATED ALWAYS AS ("packages"."nix"->'meta'->>'description') STORED,
	"homepage" varchar GENERATED ALWAYS AS ("packages"."nix"->'meta'->>'homepage') STORED,
	"generatorVersion" integer DEFAULT 1 NOT NULL,
	"nix" json NOT NULL,
	"url" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "packages_generatorVersion_pname_version_pk" PRIMARY KEY("generatorVersion","pname","version")
);
