FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
RUN apk add --no-cache python3 make g++ git

FROM base AS builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter @open-design/contracts build
RUN pnpm --filter @open-design/sidecar-proto build
RUN pnpm --filter @open-design/sidecar build
RUN pnpm --filter @open-design/platform build
RUN pnpm --filter @open-design/daemon build
RUN OD_WEB_OUTPUT_MODE= pnpm --filter @open-design/web build
RUN cd node_modules/.pnpm/better-sqlite3@12.9.0/node_modules/better-sqlite3 && npx prebuild-install || npx node-gyp rebuild --release

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

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/daemon/dist/cli.js", "--no-open", "--host", "0.0.0.0"]

# --- Agentic Security Firewall: Katman 2 (non-root hardening) ---
RUN [ -d /app ] && chown -R node:node /app || true
USER node
