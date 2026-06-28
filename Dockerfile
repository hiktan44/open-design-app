FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
RUN apk add --no-cache python3 make g++ git

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/sidecar-proto/package.json packages/sidecar-proto/
COPY packages/sidecar/package.json packages/sidecar/
COPY packages/platform/package.json packages/platform/
COPY apps/web/package.json apps/web/
COPY apps/daemon/package.json apps/daemon/
COPY apps/desktop/package.json apps/desktop/
COPY apps/packaged/package.json apps/packaged/
COPY apps/landing-page/package.json apps/landing-page/
COPY tools/dev/package.json tools/dev/
COPY tools/pack/package.json tools/pack/
COPY e2e/package.json e2e/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY --from=deps /app/apps/*/node_modules ./apps/*/node_modules
COPY --from=deps /app/tools/*/node_modules ./tools/*/node_modules
COPY . .
RUN OD_WEB_OUTPUT_MODE= pnpm run postinstall
RUN pnpm --filter @open-design/contracts build
RUN pnpm --filter @open-design/sidecar-proto build
RUN pnpm --filter @open-design/sidecar build
RUN pnpm --filter @open-design/platform build
RUN pnpm --filter @open-design/daemon build
RUN OD_WEB_OUTPUT_MODE= pnpm --filter @open-design/web build

FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache sqlite bash curl
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/sidecar-proto/package.json ./packages/sidecar-proto/
COPY --from=builder /app/packages/sidecar-proto/dist ./packages/sidecar-proto/dist
COPY --from=builder /app/packages/sidecar/package.json ./packages/sidecar/
COPY --from=builder /app/packages/sidecar/dist ./packages/sidecar/dist
COPY --from=builder /app/packages/platform/package.json ./packages/platform/
COPY --from=builder /app/packages/platform/dist ./packages/platform/dist
COPY --from=builder /app/apps/daemon/package.json ./apps/daemon/
COPY --from=builder /app/apps/daemon/dist ./apps/daemon/dist
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/out ./apps/web/out
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/tools/dev/package.json ./tools/dev/
COPY --from=builder /app/tools/dev/dist ./tools/dev/dist
COPY --from=builder /app/tools/pack/package.json ./tools/pack/
COPY --from=builder /app/tools/pack/dist ./tools/pack/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=builder /app/packages/sidecar-proto/node_modules ./packages/sidecar-proto/node_modules
COPY --from=builder /app/packages/sidecar/node_modules ./packages/sidecar/node_modules
COPY --from=builder /app/packages/platform/node_modules ./packages/platform/node_modules
COPY --from=builder /app/apps/daemon/node_modules ./apps/daemon/node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/tools/dev/node_modules ./tools/dev/node_modules
COPY --from=builder /app/tools/pack/node_modules ./tools/pack/node_modules
COPY --from=builder /app/scripts ./scripts

ENV NODE_ENV=production
ENV OD_WEB_PROD=1
ENV OD_PORT=7456

EXPOSE 7456

CMD ["node", "apps/daemon/dist/cli.js", "--no-open", "--host", "0.0.0.0"]
