# Frontend Deployment Standards
## Unibexs — Next.js on DigitalOcean App Platform

This document captures every lesson learned from the backend deployment setup and translates it
into a concrete, copy-paste-ready implementation guide for the frontend repo. Follow it exactly
to get the same predictability and consistency across both stacks.

---

## 1. Mental model: how the pipeline works

```
Bitbucket push → build Docker image → tag & push to DOCR
                                              ↓
                              doctl apps spec get (LIVE spec with real secrets)
                                              ↓
                              sed: replace image tag only
                                              ↓
                              doctl apps update (pinned tag, secrets intact)
                                              ↓
                              poll deployment phase until ACTIVE or ERROR
```

Key rules that protect you from the most painful failure modes:

1. **Never apply your committed `.do/app-staging.yaml` directly** via `doctl apps update --spec`.
   Any `type: SECRET` field with no `value:` will wipe the stored console value to `''`.
2. **Always pull-edit-push**: fetch the live spec, sed only the image tag, push it back.
3. **Pin the tag to a commit hash** (`staging-<7char-sha>`, `prod-<7char-sha>`). Never deploy `latest`.
4. **`deploy_on_push: enabled: false`** on every service. Without this, pushing `*-latest` to DOCR
   triggers an uncontrolled auto-deploy that bypasses the pipeline gate.

---

## 2. Repository structure

```
unibexs-frontend/
├── .do/
│   ├── app-staging.yaml        # Reference spec (NEVER applied directly)
│   └── app.yaml                # Reference spec (NEVER applied directly)
├── src/
│   └── app/
│       └── api/
│           └── health/
│               └── route.ts    # Health check endpoint (required)
├── next.config.ts
├── Dockerfile
├── .dockerignore
└── bitbucket-pipelines.yml
```

---

## 3. Dockerfile

Use a three-stage build: deps → builder → runner. The `standalone` output mode produces a
self-contained bundle that runs without `node_modules` in the final image.

```dockerfile
# ── Stage 1: install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# ── Stage 2: build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are baked at build time — pass them as build args.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SIGNOZ_ENDPOINT

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SIGNOZ_ENDPOINT=$NEXT_PUBLIC_SIGNOZ_ENDPOINT

RUN npm run build

# ── Stage 3: runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### `next.config.ts` — required settings

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',   // Required for the Dockerfile above
}

export default nextConfig
```

---

## 4. `.dockerignore`

```
.git
.gitignore
.env*
node_modules
.next
*.md
.do
bitbucket-pipelines.yml
```

Critical: `.env*` must be listed. Local `.env.local` / `.env.development` files must never
be baked into the image.

---

## 5. Environment variables: build-time vs runtime

`NEXT_PUBLIC_*` vars are baked at `next build` time. They must be injected via `--build-arg`
in the Docker build command — the DO platform cannot inject them at runtime. Non-public
server-side vars can be injected at runtime via the DO dashboard.

| Variable | Where set | How injected |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Bitbucket pipeline variable | `--build-arg` in `docker build` |
| `NEXT_PUBLIC_SIGNOZ_ENDPOINT` | Bitbucket pipeline variable | `--build-arg` in `docker build` |
| `SIGNOZ_INGESTION_KEY` | DO console (type: SECRET) | Runtime via DO platform |
| `SIGNOZ_SERVICE_NAME` | `.do/app*.yaml` plain value | Runtime via DO platform |
| `ENVIRONMENT` | `.do/app*.yaml` plain value | Runtime via DO platform |

---

## 6. Health check endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
```

The DO App Platform health check and smoke tests hit `/api/health`. Without this, the app will
be marked unhealthy on every deploy.

---

## 7. `.do/app-staging.yaml`

```yaml
# IMPORTANT — READ BEFORE RUNNING doctl apps update --spec
# Running this command against a live app WILL wipe any secret whose stored value
# is not included here as a literal `value:` field. All secrets are managed via
# the DO dashboard (App-Level Environment Variables). To safely update this spec:
#   1. doctl apps spec get $STAGING_FE_APP_ID > /tmp/live.yaml  (backup live state)
#   2. Make your changes to this file
#   3. doctl apps update $STAGING_FE_APP_ID --spec /tmp/live.yaml
#   4. Immediately verify secrets are still set in DO dashboard
# Do NOT add literal secret values to this file — it is committed to version control.

name: staging-frontend
region: sgp1

envs:
  - key: SIGNOZ_INGESTION_KEY
    scope: RUN_TIME
    type: SECRET

services:
  - name: unibexs-frontend
    image:
      deploy_on_push:
        enabled: false
      registry_type: DOCR
      registry: unibexs-internal
      repository: unibexs-frontend-staging
      tag: staging-latest
    instance_count: 1
    instance_size_slug: professional-xs
    http_port: 3000
    health_check:
      http_path: /api/health
      initial_delay_seconds: 30
      period_seconds: 10
      failure_threshold: 3
    envs:
      - key: ENVIRONMENT
        scope: RUN_TIME
        value: "staging"
      - key: SIGNOZ_SERVICE_NAME
        scope: RUN_TIME
        value: "unibexs-frontend"
      - key: NODE_ENV
        scope: RUN_TIME
        value: "production"
```

---

## 8. `.do/app.yaml`

```yaml
# IMPORTANT — same warnings as app-staging.yaml apply here.

name: unibexs-frontend-production
region: sgp1

envs:
  - key: SIGNOZ_INGESTION_KEY
    scope: RUN_TIME
    type: SECRET

services:
  - name: frontend
    image:
      deploy_on_push:
        enabled: false
      registry_type: DOCR
      registry: unibexs-internal
      repository: unibexs-frontend-prod
      tag: prod-latest
    instance_count: 2
    instance_size_slug: professional-xs
    http_port: 3000
    health_check:
      http_path: /api/health
      initial_delay_seconds: 30
      period_seconds: 10
      failure_threshold: 3
    envs:
      - key: ENVIRONMENT
        scope: RUN_TIME
        value: "prod"
      - key: SIGNOZ_SERVICE_NAME
        scope: RUN_TIME
        value: "unibexs-frontend"
      - key: NODE_ENV
        scope: RUN_TIME
        value: "production"
```

---

## 9. `bitbucket-pipelines.yml`

### Required Bitbucket pipeline variables

Set these in the repo/workspace settings — not in the YAML file:

| Variable | Example value |
|---|---|
| `DO_API_TOKEN` | `dop_v1_xxx` |
| `DOCR_REGISTRY` | `registry.digitalocean.com/unibexs-internal` |
| `STAGING_FE_APP_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `PROD_FE_APP_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `NEXT_PUBLIC_API_URL_STAGING` | `https://staging-backend.ondigitalocean.app` |
| `NEXT_PUBLIC_API_URL_PROD` | `https://api.unibexs.com` |

### Full pipeline

```yaml
image: docker:27

definitions:
  services:
    docker:
      memory: 3072

  steps:

    - step: &install-doctl
        name: Install doctl
        script:
          - apt-get update && apt-get install -y curl wget
          - wget -q https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
          - tar xf doctl-1.104.0-linux-amd64.tar.gz
          - mv doctl /usr/local/bin
          - doctl auth init --access-token $DO_API_TOKEN

    # ── Staging ─────────────────────────────────────────────────────────────

    - step: &build-and-push-staging
        name: Build & Push (Staging)
        services:
          - docker
        script:
          - rm -f .env*
          - export IMAGE_TAG="staging-${BITBUCKET_COMMIT:0:7}"
          - docker login registry.digitalocean.com --username $DO_API_TOKEN --password $DO_API_TOKEN
          - |
            docker build --no-cache \
              --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL_STAGING \
              -t $DOCR_REGISTRY/unibexs-frontend-staging:${IMAGE_TAG} \
              -t $DOCR_REGISTRY/unibexs-frontend-staging:staging-latest \
              .
          - docker push $DOCR_REGISTRY/unibexs-frontend-staging:${IMAGE_TAG}
          - docker push $DOCR_REGISTRY/unibexs-frontend-staging:staging-latest

    - step: &deploy-staging
        name: Deploy to Staging
        deployment: staging
        script:
          - apt-get update && apt-get install -y wget
          - wget -q https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
          - tar xf doctl-1.104.0-linux-amd64.tar.gz
          - mv doctl /usr/local/bin
          - doctl auth init --access-token $DO_API_TOKEN
          - export IMAGE_TAG="staging-${BITBUCKET_COMMIT:0:7}"
          # Pull-edit-push: fetch LIVE spec (secrets intact), pin tag, push back.
          - doctl apps spec get $STAGING_FE_APP_ID > /tmp/live-staging.yaml
          - |
            sed "s/tag: staging-[a-z0-9]*/tag: ${IMAGE_TAG}/g" /tmp/live-staging.yaml > /tmp/live-staging-pinned.yaml
          - echo "Pinned image tags to ${IMAGE_TAG}:"
          - 'grep "tag: staging" /tmp/live-staging-pinned.yaml'
          - doctl apps update $STAGING_FE_APP_ID --spec /tmp/live-staging-pinned.yaml
          - rm -f /tmp/live-staging.yaml /tmp/live-staging-pinned.yaml
          - echo "Waiting for deployment to be created..."
          - sleep 15
          - DEPLOY_ID=$(doctl apps list-deployments $STAGING_FE_APP_ID --format ID --no-header 2>/dev/null | head -1)
          - ATTEMPTS=0
          - MAX_ATTEMPTS=40
          - |
            while [ "$ATTEMPTS" -lt "$MAX_ATTEMPTS" ]; do
              PHASE=$(doctl apps get-deployment $STAGING_FE_APP_ID $DEPLOY_ID --format Phase --no-header 2>/dev/null)
              echo "  Attempt $ATTEMPTS/$MAX_ATTEMPTS -- phase: $PHASE"
              if [ "$PHASE" = "ACTIVE" ]; then
                echo "Deployment succeeded."
                break
              elif [ "$PHASE" = "ERROR" ] || [ "$PHASE" = "CANCELED" ]; then
                echo "Deployment failed: $PHASE"
                exit 1
              fi
              sleep 15
              ATTEMPTS=$((ATTEMPTS + 1))
            done

    - step: &smoke-test-staging
        name: Smoke Test (Staging)
        script:
          - sleep 10
          - STAGING_URL=$(doctl apps get $STAGING_FE_APP_ID --format LiveURL --no-header 2>/dev/null)
          - 'echo "Resolved staging URL: $STAGING_URL"'
          - curl -sf "${STAGING_URL}/api/health" | grep -q '"status":"ok"'
          - echo "Smoke test passed."

    # ── Production ──────────────────────────────────────────────────────────

    - step: &build-and-push-prod
        name: Build & Push (Production)
        services:
          - docker
        script:
          - rm -f .env*
          - export IMAGE_TAG="prod-${BITBUCKET_COMMIT:0:7}"
          - docker login registry.digitalocean.com --username $DO_API_TOKEN --password $DO_API_TOKEN
          - |
            docker build --no-cache \
              --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL_PROD \
              -t $DOCR_REGISTRY/unibexs-frontend-prod:${IMAGE_TAG} \
              -t $DOCR_REGISTRY/unibexs-frontend-prod:prod-latest \
              .
          - docker push $DOCR_REGISTRY/unibexs-frontend-prod:${IMAGE_TAG}
          - docker push $DOCR_REGISTRY/unibexs-frontend-prod:prod-latest

    - step: &deploy-prod
        name: Deploy to Production
        deployment: production
        trigger: manual
        script:
          - set +e
          - DEPLOY_STATUS=success
          - apt-get update && apt-get install -y wget
          - wget -q https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
          - tar xf doctl-1.104.0-linux-amd64.tar.gz
          - mv doctl /usr/local/bin
          - doctl auth init --access-token $DO_API_TOKEN
          - export IMAGE_TAG="prod-${BITBUCKET_COMMIT:0:7}"
          - doctl apps spec get $PROD_FE_APP_ID > /tmp/live-prod.yaml
          - |
            sed "s/tag: prod-[a-z0-9]*/tag: ${IMAGE_TAG}/g" /tmp/live-prod.yaml > /tmp/live-prod-pinned.yaml
          - echo "Pinned image tags to ${IMAGE_TAG}:"
          - 'grep "tag: prod" /tmp/live-prod-pinned.yaml'
          - doctl apps update $PROD_FE_APP_ID --spec /tmp/live-prod-pinned.yaml
          - UPDATE_EXIT_CODE=$?
          - rm -f /tmp/live-prod.yaml /tmp/live-prod-pinned.yaml
          - |
            if [ "$UPDATE_EXIT_CODE" -ne 0 ]; then
              DEPLOY_STATUS=failure
            fi
          - |
            if [ "$DEPLOY_STATUS" = "success" ]; then
              echo "Waiting for deployment to be created..."
              sleep 15
              DEPLOY_ID=$(doctl apps list-deployments $PROD_FE_APP_ID --format ID --no-header 2>/dev/null | head -1)
              ATTEMPTS=0
              MAX_ATTEMPTS=40
              while [ "$ATTEMPTS" -lt "$MAX_ATTEMPTS" ]; do
                PHASE=$(doctl apps get-deployment $PROD_FE_APP_ID $DEPLOY_ID --format Phase --no-header 2>/dev/null)
                echo "  Attempt $ATTEMPTS/$MAX_ATTEMPTS -- phase: $PHASE"
                if [ "$PHASE" = "ACTIVE" ]; then
                  echo "Deployment succeeded."
                  break
                elif [ "$PHASE" = "ERROR" ] || [ "$PHASE" = "CANCELED" ]; then
                  DEPLOY_STATUS=failure
                  break
                fi
                sleep 15
                ATTEMPTS=$((ATTEMPTS + 1))
              done
            fi
          - echo "$DEPLOY_STATUS" > deploy_status.txt

    - step: &smoke-test-prod
        name: Smoke Test (Production)
        script:
          - sleep 10
          - PROD_URL=$(doctl apps get $PROD_FE_APP_ID --format LiveURL --no-header 2>/dev/null)
          - 'echo "Resolved prod URL: $PROD_URL"'
          - curl -sf "${PROD_URL}/api/health" | grep -q '"status":"ok"'
          - echo "Smoke test passed."

# ── Branch pipelines ────────────────────────────────────────────────────────

pipelines:
  branches:
    release/staging:
      - step: *build-and-push-staging
      - step: *deploy-staging
      - step: *smoke-test-staging

    release/prod:
      - step: *build-and-push-prod
      - step: *deploy-prod
      - step: *smoke-test-prod
```

---

## 10. Bitbucket YAML gotchas (critical — caused unrunnable pipelines on the backend)

### Gotcha 1: comment after a `|` block scalar

A comment line placed between a `|` block and the next `- command` creates a phantom null item,
which the Bitbucket YAML parser reports as `Missing or empty command string`.

```yaml
# BAD — comment sits between | block and next step
- |
  multiline command here
# This comment creates a phantom null item
- next command

# GOOD — comment before the | block
# This comment is safe here
- |
  multiline command here
- next command
```

### Gotcha 2: `: ` (colon-space) inside an unquoted YAML scalar

Any `- command "key: value"` where the double-quoted string contains `: ` will cause the YAML
parser to interpret it as a mapping key, breaking the pipeline.

```yaml
# BAD — `: ` inside unquoted scalar
- grep "tag: staging" /tmp/file.yaml
- echo "URL: $MY_URL"

# GOOD — wrap the entire step in YAML single quotes
- 'grep "tag: staging" /tmp/file.yaml'
- 'echo "URL: $MY_URL"'
```

**Rule of thumb**: any `- command` that contains a double-quoted string with `: ` must be
wrapped in YAML single quotes.

---

## 11. DO App Platform secret management

### What causes secrets to be wiped

Running `doctl apps update --spec .do/app-staging.yaml` against a live app wipes every stored
secret whose spec entry has `type: SECRET` but no `value:` field. This is DO App Platform
behaviour — it treats the absence of `value:` as "set to empty string".

This was the root cause of `AUTH_SECRET_KEY validation error` on the backend. It will cause
the same class of failures on the frontend if `SIGNOZ_INGESTION_KEY` gets wiped.

### The pull-edit-push pattern (always use this)

```bash
# Backup live spec (contains actual stored secret values)
doctl apps spec get $STAGING_FE_APP_ID > /tmp/live.yaml

# Edit only what you need (e.g. image tag)
sed "s/tag: staging-.*/tag: staging-abc1234/g" /tmp/live.yaml > /tmp/live-pinned.yaml

# Push the modified live spec back (secrets preserved because they were in the live spec)
doctl apps update $STAGING_FE_APP_ID --spec /tmp/live-pinned.yaml

# Clean up
rm -f /tmp/live.yaml /tmp/live-pinned.yaml
```

Never apply the committed `.do/app-staging.yaml` or `.do/app.yaml` directly.

### When you DO need to update the DO App Platform config (new service, new env var, etc.)

```bash
# 1. Get live spec as baseline
doctl apps spec get $STAGING_FE_APP_ID > /tmp/live.yaml

# 2. Make your structural changes to /tmp/live.yaml manually

# 3. Apply the edited live spec
doctl apps update $STAGING_FE_APP_ID --spec /tmp/live.yaml

# 4. IMMEDIATELY verify secrets are still present in the DO dashboard

# 5. Update the committed .do/app-staging.yaml to reflect the structural changes
#    (so it stays in sync as documentation — but it is never applied directly)
```

---

## 12. DOCR image naming

| Environment | DOCR repository | Tags |
|---|---|---|
| Staging | `unibexs-frontend-staging` | `staging-<7char-sha>` (deployed) + `staging-latest` (floating) |
| Production | `unibexs-frontend-prod` | `prod-<7char-sha>` (deployed) + `prod-latest` (floating) |

Always deploy the pinned `env-<sha>` tag. The `*-latest` tag is pushed as a convenience alias
only and must never be what `doctl apps update` pins in the live spec.

---

## 13. Instance sizing (match the backend)

| Environment | Instance type | Count |
|---|---|---|
| Staging | `professional-xs` | 1 |
| Production | `professional-xs` | 2 |

---

## 14. Cross-stack consistency matrix

| Concern | Backend | Frontend |
|---|---|---|
| Health check path | `/api/health` | `/api/health` |
| HTTP port | `8000` | `3000` |
| Image tag format | `env-<7char-sha>` | `env-<7char-sha>` |
| `deploy_on_push` | `enabled: false` | `enabled: false` |
| `alembic upgrade heads` (plural) | yes | N/A |
| `SIGNOZ_SERVICE_NAME` | `unibexs-api` | `unibexs-frontend` |
| `ENVIRONMENT` value | `staging` / `prod` | `staging` / `prod` |
| Secret management | Pull-edit-push | Pull-edit-push |
| Instance size | `professional-xs` | `professional-xs` |
| Region | `sgp1` | `sgp1` |
| `DO_SPACES_REGION` (if used) | `sgp1` (lowercase) | `sgp1` (lowercase) |
| Docker build cache | `--no-cache` | `--no-cache` |
| `.env*` in image | `rm -f .env*` before build | `rm -f .env*` before build |

> **`DO_SPACES_REGION` must be lowercase `sgp1`.** Uppercase `SGP1` breaks the SigV4
> credential scope signature and causes `NoSuchKey` / `SignatureDoesNotMatch` errors on all
> presigned URL operations.

---

## 15. SigNoz observability

Use the same `service.name` on both environments and filter by `deployment.environment` in the
SigNoz UI. This means:

- `SIGNOZ_SERVICE_NAME=unibexs-frontend` (same for staging and prod)
- `ENVIRONMENT=staging` or `ENVIRONMENT=prod` (set per-environment in the DO spec)

In your telemetry setup, attach `deployment.environment` as an OTel resource attribute (mirrors
what `app/core/telemetry.py` does on the backend):

```typescript
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.SIGNOZ_SERVICE_NAME,
  'deployment.environment': process.env.ENVIRONMENT,
  [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
})
```

---

## 16. First-time setup checklist

- [ ] Create DOCR repositories: `unibexs-frontend-staging`, `unibexs-frontend-prod`
- [ ] Create two DO App Platform apps (staging + prod) manually with the correct name
- [ ] Set all secrets via DO dashboard (not YAML): `SIGNOZ_INGESTION_KEY`
- [ ] Set `NEXT_PUBLIC_API_URL_STAGING` and `NEXT_PUBLIC_API_URL_PROD` as Bitbucket pipeline variables
- [ ] Set `DO_API_TOKEN`, `DOCR_REGISTRY`, `STAGING_FE_APP_ID`, `PROD_FE_APP_ID` as Bitbucket pipeline variables
- [ ] Add `output: 'standalone'` to `next.config.ts`
- [ ] Create `src/app/api/health/route.ts` health check endpoint
- [ ] Verify `deploy_on_push: enabled: false` is in the committed `.do/` specs
- [ ] Run a test staging deploy and confirm phase reaches `ACTIVE`
- [ ] Confirm secrets are still present in DO dashboard after first deploy