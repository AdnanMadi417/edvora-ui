FROM node:lts-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Set specific pnpm version (change to match your local version)
ENV PNPM_VERSION=8.15.5

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    pnpm install --frozen-lockfile --no-optional

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable to skip type checking during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_TYPE_CHECK=true

RUN corepack enable pnpm && pnpm run build

# Stage 3: staging server
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=staging

# Copy public folder
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]