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

FROM dependencies AS builder

COPY web ./web

ENV DOCKER_BUILD=true

RUN pnpm --filter web build

FROM node:24-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /workspace/web/public ./web/public
COPY --from=builder --chown=nextjs:nodejs /workspace/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/web/.next/static ./web/.next/static
# Next's standalone tracer preserves the pnpm link but omits the helper files.
COPY --from=builder --chown=nextjs:nodejs /workspace/node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers ./node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers

USER nextjs

EXPOSE 3001

CMD ["node", "web/server.js"]
