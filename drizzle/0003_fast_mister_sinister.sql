ALTER TABLE "packages" DROP COLUMN "semver";
-- Drop `try_cast_to_semver`
DROP FUNCTION IF EXISTS try_cast_to_semver(TEXT);
-- Drop the `semver` extension
DROP EXTENSION IF EXISTS "semver";
