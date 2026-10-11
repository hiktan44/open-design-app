FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
RUN apk add --no-cache python3 make g++ git

FROM base AS builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter @open-design/release build
RUN pnpm --filter @open-design/components build
RUN pnpm --filter @open-design/platform build
RUN pnpm --filter @open-design/registry-protocol build
RUN pnpm --filter @open-design/contracts build
RUN pnpm --filter @open-design/sidecar-proto build
RUN pnpm --filter @open-design/sidecar build
RUN pnpm --filter @open-design/host build
RUN pnpm --filter @open-design/diagnostics build
RUN pnpm --filter @open-design/launcher-proto build
RUN pnpm --filter @open-design/plugin-runtime build
RUN pnpm --filter @open-design/agui-adapter build
RUN pnpm --filter @open-design/daemon build
RUN OD_WEB_OUTPUT_MODE= pnpm --filter @open-design/web build
# Bağlayıcı workspace kökünün değil daemon paketinin bağımlılığıdır.
RUN pnpm --filter @open-design/daemon rebuild better-sqlite3
RUN node --experimental-strip-types scripts/check-native-sqlite.ts

FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache sqlite bash curl tini
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/daemon ./apps/daemon
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/tools ./tools
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/*/node_modules ./packages/*/node_modules
COPY --from=builder /app/apps/*/node_modules ./apps/*/node_modules
COPY --from=builder /app/tools/*/node_modules ./tools/*/node_modules
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/design-systems ./design-systems
COPY --from=builder /app/skills ./skills

ENV NODE_ENV=production
ENV OD_WEB_PROD=1
ENV OD_PORT=7456
# Trust reverse-proxy (Traefik) and accept same-origin browser requests on
# public hosts. Local installs keep the loopback default by not setting this.
ENV OD_ALLOW_REMOTE_DAEMON=1

EXPOSE 7456

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e 'fetch("http://127.0.0.1:" + (process.env.OD_PORT || "7456") + "/api/health", {signal: AbortSignal.timeout(4000)}).then(async response => { if (!response.ok || (await response.json()).ok !== true) process.exit(1); }).catch(() => process.exit(1))'

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/daemon/dist/cli.js", "--no-open", "--host", "0.0.0.0"]

# --- Agentic Security Firewall: Katman 2 (non-root hardening) ---
RUN [ -d /app ] && chown -R node:node /app || true
USER node
# Son imajdaki dosyaları, kullanıcı izinlerini ve gerçek Node ABI'sini doğrula.
RUN node --experimental-strip-types scripts/check-native-sqlite.ts
