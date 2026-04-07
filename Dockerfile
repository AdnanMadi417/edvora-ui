FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV PNPM_VERSION=10.28.1
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    pnpm config set network-timeout 600000 && \
    pnpm config set fetch-timeout 600000 && \
    pnpm config set fetch-retries 5 && \
    # Install ALL dependencies including optionalDependencies (removes --no-optional)
    pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_TYPE_CHECK=true
ENV PNPM_VERSION=10.28.1

# NEXT_PUBLIC_* vars must be present at build time so Next.js can bake them
# into the client bundle. Pass them via --build-arg in the pipeline.
ARG NEXT_PUBLIC_API_URL
# ARG SIGNOZ_ENDPOINT
# ARG SIGNOZ_INGESTION_KEY
# ARG SIGNOZ_SERVICE_NAME
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
# ENV SIGNOZ_ENDPOINT=${SIGNOZ_ENDPOINT}
# ENV SIGNOZ_INGESTION_KEY=${SIGNOZ_INGESTION_KEY}
# ENV SIGNOZ_SERVICE_NAME=${SIGNOZ_SERVICE_NAME:-unibexs-ui}

# Copy EVERYTHING from deps stage including optional SWC binaries
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy source code
COPY . .

# Enable corepack for pnpm in builder stage
RUN corepack enable pnpm && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    pnpm run build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
