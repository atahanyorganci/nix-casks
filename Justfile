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
    just vercel link --repo
    pnpm turbo link

[group("setup")]
install:
    pnpm install --frozen-lockfile

[group("setup")]
env: vercel-link
    just vercel env pull

[group("setup")]
setup: install env

[group("dev")]
dev *args='':
    process-compose up {{args}}

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
seed:
    pnpm tsx "src/server/db/seed.ts"

[group("db")]
b:
    echo $NEON_API_KEY $NEON_PROJECT_ID
