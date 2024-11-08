CREATE TABLE IF NOT EXISTS "api_keys" (
	"salt" varchar PRIMARY KEY NOT NULL,
	"hash" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packages" (
	"name" varchar NOT NULL,
	"pname" varchar GENERATED ALWAYS AS ("packages"."nix"->>'pname') STORED NOT NULL,
	"version" varchar GENERATED ALWAYS AS ("packages"."nix"->>'version') STORED NOT NULL,
	"nix" json NOT NULL,
	"url" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "packages_pname_version_pk" PRIMARY KEY("pname","version")
);
