# syntax=docker/dockerfile:1

FROM node:24-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /workspace

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json
COPY web/package.json ./web/package.json

RUN pnpm install --frozen-lockfile

FROM base AS production-dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json
COPY web/package.json ./web/package.json

RUN pnpm install --frozen-lockfile --prod --filter api...

FROM dependencies AS builder

COPY api ./api

ENV DATABASE_URL=postgresql://postgres:postgres@database:5432/solasstec_portaria?schema=public

RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3001

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=production-dependencies --chown=node:node /workspace/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /workspace/api/node_modules ./api/node_modules
COPY --from=builder --chown=node:node /workspace/api/dist ./api/dist
COPY --from=builder --chown=node:node /workspace/api/generated ./api/generated
COPY --chown=node:node api/package.json api/prisma.config.ts ./api/
COPY --chown=node:node api/prisma ./api/prisma

USER node

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter api prisma:migrate:deploy && node api/dist/src/main.js"]
