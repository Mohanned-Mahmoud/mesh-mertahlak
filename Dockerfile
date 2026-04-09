FROM cgr.dev/chainguard/node:latest-dev AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json .npmrc ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/api-server run build

FROM cgr.dev/chainguard/node:latest

ENV NODE_ENV=production
WORKDIR /app/artifacts/api-server

COPY --from=build /app/artifacts/api-server/dist ./dist

CMD ["--enable-source-maps", "./dist/index.mjs"]
