# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy SQL migrations (read at runtime by the migration runner)
COPY src/migrations/ ./src/migrations/

# Create uploads directories
RUN mkdir -p uploads/avatars uploads/banners uploads/logos

EXPOSE 3000

CMD ["node", "dist/index.js"]
