# Single-stage build — avoids multi-stage COPY cache issues on Render
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Ensure public dir exists (all images served from Bunny CDN)
RUN mkdir -p public && touch public/.gitkeep

# Build client and server
RUN pnpm build

# Remove dev dependencies after build
RUN pnpm prune --prod

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "scripts/start-prod.mjs"]
