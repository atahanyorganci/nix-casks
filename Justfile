set dotenv-filename := ".env.local"
set dotenv-load
set export

[group("setup")]
install:
    pnpm install --frozen-lockfile

[group("setup")]
vercel:
    #!/usr/bin/env bash
    set -euxo pipefail

    rm -rf .vercel
    pnpm vercel whoami
    pnpm vercel link --repo --yes
    pnpm turbo link --yes

[group("setup")]
env: vercel
    pnpm vercel env pull ".env.local"

[group("setup")]
setup: install env

[group("dev")]
dev:
    process-compose up

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
