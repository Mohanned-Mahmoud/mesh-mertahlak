FROM cgr.dev/chainguard/node:latest-dev AS build

USER root
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# تعريف متغيرات الفرونت اند وقت البيلد
ARG VITE_API_BASE_URL=/api
ARG VITE_SOCKET_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json .npmrc ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts

RUN corepack pnpm install --frozen-lockfile

# هنعمل بيلد للباك اند وللفرونت اند
RUN corepack pnpm --filter @workspace/api-server run build
RUN corepack pnpm run build:frontend

FROM cgr.dev/chainguard/node:latest

ENV NODE_ENV=production
WORKDIR /app

# نسخ فولدرات الباك اند
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
# نسخ فولدرات الفرونت اند
COPY --from=build /app/artifacts/date-judge/dist/public ./artifacts/date-judge/dist/public

# تشغيل السيرفر من المسار الجديد
CMD ["--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]