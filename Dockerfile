FROM cgr.dev/chainguard/node:latest-dev AS build

USER root
WORKDIR /app

# Run pnpm through corepack directly to avoid writing to /usr/bin in non-root images.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json .npmrc ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts

RUN corepack pnpm install --frozen-lockfile
RUN corepack pnpm --filter @workspace/api-server run build

FROM cgr.dev/chainguard/node:latest

ENV NODE_ENV=production
WORKDIR /app/artifacts/api-server

COPY --from=build /app/artifacts/api-server/dist ./dist

CMD ["--enable-source-maps", "./dist/index.mjs"]
