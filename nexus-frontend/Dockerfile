# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the compiled SvelteKit output
COPY --from=builder /app/build ./build

EXPOSE 3001

CMD ["node", "build"]
