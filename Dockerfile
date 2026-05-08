# Glucose Managed — Dockerfile (Render Docker runtime)
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.9

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# ─── Production stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.9

# Install production deps only (no sharp — not needed at runtime)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built artifacts and runtime files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/src/lib ./src/lib

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "scripts/start-prod.mjs"]
