-- Enable `semver` extension
CREATE EXTENSION IF NOT EXISTS "semver";
-- Failable cast to semver
CREATE OR REPLACE FUNCTION try_cast_to_semver (text_version TEXT) RETURNS semver LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
	BEGIN
		RETURN text_version::semver;
	EXCEPTION
		WHEN OTHERS THEN
			RETURN NULL;
	END;
END;
$$;
