FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including devDeps needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build client and server
RUN pnpm build

# ─── Production image ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Copy runtime data (JSON article DB, product catalog)
COPY --from=builder /app/src/data ./src/data

# Copy scripts needed at runtime (cron, start)
COPY --from=builder /app/scripts ./scripts

# Copy server libs (db.mjs, aeo.mjs etc.)
COPY --from=builder /app/src/lib ./src/lib

# NOTE: public/ directory intentionally omitted — all images are on Bunny CDN

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start server with cron jobs
CMD ["node", "scripts/start-prod.mjs"]
