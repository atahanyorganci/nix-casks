set dotenv-filename := ".env.local"
set dotenv-load
set export

[group("vercel")]
vercel *args='':
    pnpm dlx vercel@latest {{args}}

[group("vercel")]
vercel-login:
    just vercel whoami

[group("vercel")]
vercel-link: vercel-login
    #!/usr/bin/env bash

    rm -rf .vercel
    just vercel link --repo --yes
    pnpm turbo link

[group("setup")]
install:
    pnpm install --frozen-lockfile

[group("setup")]
env: vercel-link
    just vercel env pull

[group("setup")]
setup: install env

[group("build")]
build:
    pnpm turbo run build

[group("dev")]
dev *args='':
    process-compose up {{args}}

[group("db")]
db:
    docker compose up

[group("db")]
generate name:
    pnpm db:generate --name {{name}}

[group("db")]
migrate:
    pnpm db:migrate

[group("db")]
studio:
    pnpm db:studio

[group("db")]
push:
    pnpm db:push

[group("db")]
dump NAME:
    #!/usr/bin/env bash

    pg_dump \
        --verbose \
        --dbname="$DATABASE_URL&sslrootcert=system" \
        --data-only \
        --format=custom \
        --no-owner --no-privileges \
        -t public.packages \
        -t public.archives \
        -f $NAME

[group("db")]
restore NAME:
    #!/usr/bin/env bash

    pg_restore \
        --verbose \
        --dbname="$DATABASE_URL&sslrootcert=system" \
        --data-only \
        --no-owner --no-privileges \
        $NAME

[group("db")]
repl:
    psql --dbname="$DATABASE_URL&sslrootcert=system"
