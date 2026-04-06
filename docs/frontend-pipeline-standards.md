# Unibexs Frontend — Bitbucket Pipelines CI/CD Standards

> Scope: Next.js frontend application hosted on DigitalOcean App Platform via DOCR.
> These standards are derived directly from the working backend pipeline and MUST stay
> consistent with it. Every pattern documented here has a one-to-one equivalent in
> `bitbucket-pipelines.yml` at the root of the backend repository.

---

## 1. Branch Strategy and Step Sequence

The frontend follows the same three-branch model as the backend. Step names must match
exactly so Slack reports and incident timelines read the same way across both services.

```
release/staging  →  test → build-and-push-staging → deploy-staging → smoke-test-staging → notify-slack-staging
release/prod     →  test → build-and-push-prod → deploy-prod (manual) → smoke-test-prod → notify-slack-prod
main             →  test → notify-slack
```

The `deploy-prod` step MUST carry `trigger: manual` and `deployment: production`, identical
to the backend, so a human must click Run before anything reaches production.

---

## 2. Required Bitbucket Repository Variables

Set all of these in Repository Settings > Pipelines > Repository variables.
Mark every token and secret as Secured (masked in logs).

| Variable name                    | What it is                                                  | Secured |
|----------------------------------|-------------------------------------------------------------|---------|
| `DIGITALOCEAN_ACCESS_TOKEN`      | DOCR read/write token — used in build step for doctl registry login | Yes |
| `DO_API_TOKEN`                   | DigitalOcean API token — used in deploy step for doctl apps operations | Yes |
| `FE_STAGING_APP_ID`              | DO App Platform app ID for the staging frontend app         | Yes |
| `FE_PROD_APP_ID`                 | DO App Platform app ID for the production frontend app      | Yes |
| `WEBHOOK_URL`                    | Slack incoming webhook URL                                  | Yes |
| `NEXT_PUBLIC_API_URL`            | Public API base URL injected at build time (staging value)  | No  |
| `NEXT_PUBLIC_API_URL_PROD`       | Public API base URL injected at build time (prod value)     | No  |

Note: `NEXT_PUBLIC_*` variables are baked into the Next.js build bundle at compile time.
They are NOT runtime secrets, but they must still be supplied to the build step as build
arguments. Do NOT pass them as Docker `--build-arg` if they contain secrets — use separate
non-public env vars for anything sensitive and inject them at runtime via the DO dashboard.

---

## 3. Step-by-Step Implementation

### 3.1 Global image

Use a Node image that matches your local development version. Pin the minor version
to avoid unexpected breakage between pipeline runs.

```yaml
image: node:20-slim
```

### 3.2 test step

```yaml
- step: &test
    name: Test
    image: node:20-slim
    script:
      - set +e   # IMPORTANT: do not auto-exit on error
      - TEST_STATUS=success
      # Install dependencies — prefer ci over install to respect package-lock.json
      - npm ci
      - TEST_EXIT_CODE_INSTALL=$?
      - if [ "$TEST_EXIT_CODE_INSTALL" -ne 0 ]; then
          TEST_STATUS=failure;
        fi
      # Run unit / component tests with coverage
      - npx vitest run --coverage --reporter=junit --outputFile=test-reports/report.xml
      - TEST_EXIT_CODE=$?
      - if [ "$TEST_EXIT_CODE" -ne 0 ]; then
          TEST_STATUS=failure;
        fi
      - echo "$TEST_STATUS" > test_status.txt
    artifacts:
      - test-reports/**
      - test_status.txt
```

Differences from the backend test step:

- `npm ci` replaces `uv sync`. Use `npm ci` (not `npm install`) so the lockfile is
  enforced and the workspace matches production exactly.
- `npx vitest run --coverage` replaces `uv run pytest`. If the project uses Jest instead,
  replace with `npx jest --coverage --reporters=jest-junit`.
- No `.env` file needs to be written for tests unless the test suite requires env vars.
  If it does, write them with `echo "VAR=value" >> .env.test` exactly as the backend does.
- Coverage report goes to `test-reports/report.xml` — same artifact path convention.
- No Codecov upload is required on day one, but if added later mirror the backend curl
  pattern exactly.

### 3.3 build-and-push-staging step

```yaml
- step: &build-and-push-staging
    name: Build and Push Docker Image (staging)
    services:
      - docker
    caches:
      - docker
    script:
      - set +e
      - BUILD_STATUS=success
      - apt-get update && apt-get install -y wget
      - wget -q https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
      - tar xf doctl-1.104.0-linux-amd64.tar.gz
      - mv doctl /usr/local/bin
      - doctl auth init --access-token $DIGITALOCEAN_ACCESS_TOKEN
      - doctl registry login
      - export IMAGE_NAME="registry.digitalocean.com/unibexs-internal/unibexs-frontend-staging"
      - export IMAGE_TAG="staging-${BITBUCKET_COMMIT:0:7}"
      - export IMAGE_FULL="${IMAGE_NAME}:${IMAGE_TAG}"
      # Remove ALL .env files before building — defence-in-depth alongside .dockerignore
      - rm -f .env .env.staging .env.dev .env.prod .env.local .env.production .env.development
      - >
        docker build
        --platform linux/amd64
        --no-cache
        --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
        -t "${IMAGE_FULL}"
        -t "${IMAGE_NAME}:staging-latest"
        -f Dockerfile .
      - BUILD_EXIT_CODE=$?
      - if [ "$BUILD_EXIT_CODE" -ne 0 ]; then
          BUILD_STATUS=failure;
        fi
      - echo "$BUILD_STATUS" > build_status.txt
      - docker push ${IMAGE_FULL}
      - PUSH_EXIT_CODE=$?
      - if [ "$PUSH_EXIT_CODE" -ne 0 ]; then
          BUILD_STATUS=failure;
          echo "$BUILD_STATUS" > build_status.txt;
        fi
      - docker push ${IMAGE_NAME}:staging-latest
      - PUSH_LATEST_EXIT_CODE=$?
      - if [ "$PUSH_LATEST_EXIT_CODE" -ne 0 ]; then
          BUILD_STATUS=failure;
          echo "$BUILD_STATUS" > build_status.txt;
        fi
      - echo "Image pushed successfully:"
      - echo "  ${IMAGE_FULL}"
      - echo "  ${IMAGE_NAME}:staging-latest"
    artifacts:
      - build_status.txt
```

Differences from the backend build step:

- Repository name is `unibexs-frontend-staging` (not `unibexs-backend-staging`).
- `--build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` passes the public API URL into
  the Next.js build. Add additional `--build-arg` flags for any other `NEXT_PUBLIC_*`
  variables the app needs. These are NOT secrets, they end up in the browser bundle.
- `--no-cache` is mandatory, same as the backend. Never add `--cache-from`.
- The extended `.env` removal list adds `.env.production` and `.env.development` because
  Next.js recognises those filenames at build time. The backend does not have them.
- `set +e` is at the top of the script block, not buried — this is required.

### 3.4 build-and-push-prod step

```yaml
- step: &build-and-push-prod
    name: Build and Push Docker Image (prod)
    services:
      - docker
    caches:
      - docker
    script:
      - set +e
      - BUILD_STATUS=success
      - apt-get update && apt-get install -y wget
      - wget -q https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
      - tar xf doctl-1.104.0-linux-amd64.tar.gz
      - mv doctl /usr/local/bin
      - doctl auth init --access-token $DIGITALOCEAN_ACCESS_TOKEN
      - doctl registry login
      - export IMAGE_NAME="registry.digitalocean.com/unibexs-internal/unibexs-frontend-prod"
      - export IMAGE_TAG="prod-${BITBUCKET_COMMIT:0:7}"
      - export IMAGE_FULL="${IMAGE_NAME}:${IMAGE_TAG}"
      - rm -f .env .env.staging .env.dev .env.prod .env.local .env.production .env.development
      - >
        docker build
        --platform linux/amd64
        --no-cache
        --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL_PROD
        -t "${IMAGE_FULL}"
        -t "${IMAGE_NAME}:prod-latest"
        -f Dockerfile .
      - BUILD_EXIT_CODE=$?
      - if [ "$BUILD_EXIT_CODE" -ne 0 ]; then
          BUILD_STATUS=failure;
        fi
      - echo "$BUILD_STATUS" > build_status.txt
      - echo "$IMAGE_TAG" > image_tag.txt
      - docker push ${IMAGE_FULL}
      - PUSH_EXIT_CODE=$?
      - if [ "$PUSH_EXIT_CODE" -ne 0 ]; then
          BUILD_STATUS=failure;
          echo "$BUILD_STATUS" > build_status.txt;
        fi
      - docker push ${IMAGE_NAME}:prod-latest
      - PUSH_LATEST_EXIT_CODE=$?
      - if [ "$PUSH_LATEST_EXIT_CODE" -ne 0 ]; then
          BUILD_STATUS=failure;
          echo "$BUILD_STATUS" > build_status.txt;
        fi
      - echo "Image pushed successfully:"
      - echo "  ${IMAGE_FULL}"
      - echo "  ${IMAGE_NAME}:prod-latest"
    artifacts:
      - build_status.txt
      - image_tag.txt
```

`image_tag.txt` is saved as an artifact just as the backend does — it gives downstream
steps and humans an auditable record of exactly which tag was deployed.

### 3.5 deploy-staging step

```yaml
- step: &deploy-staging
    name: Deploy to Staging
    script:
      - set +e
      - DEPLOY_STATUS=success
      - apt-get update && apt-get install -y curl wget
      - wget -q https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
      - tar xf doctl-1.104.0-linux-amd64.tar.gz
      - mv doctl /usr/local/bin
      - doctl auth init --access-token $DO_API_TOKEN
      - export IMAGE_TAG="staging-${BITBUCKET_COMMIT:0:7}"
      # Pull-edit-push: fetch the LIVE spec from DO (which holds actual secret values),
      # replace only the image tag, push back. Never apply the committed .do/app.yaml
      # directly — it does not contain secret values and will wipe them.
      - doctl apps spec get $FE_STAGING_APP_ID > /tmp/live-fe-staging.yaml
      - |
        sed "s/tag: staging-[a-z0-9]*/tag: ${IMAGE_TAG}/g" /tmp/live-fe-staging.yaml > /tmp/live-fe-staging-pinned.yaml
      - echo "Pinned image tags to ${IMAGE_TAG}:"
      - 'grep "tag: staging" /tmp/live-fe-staging-pinned.yaml'
      - doctl apps update $FE_STAGING_APP_ID --spec /tmp/live-fe-staging-pinned.yaml
      - UPDATE_EXIT_CODE=$?
      - rm -f /tmp/live-fe-staging.yaml /tmp/live-fe-staging-pinned.yaml
      - |
        if [ "$UPDATE_EXIT_CODE" -ne 0 ]; then
          DEPLOY_STATUS=failure
        fi
      - doctl apps spec get $FE_STAGING_APP_ID
      # Wait for DigitalOcean to create and run the deployment triggered by the spec update
      - |
        if [ "$DEPLOY_STATUS" = "success" ]; then
          echo "Waiting for deployment to be created..."
          sleep 15
          DEPLOY_ID=$(doctl apps list-deployments $FE_STAGING_APP_ID --format ID --no-header 2>/dev/null | head -1)
          echo "Polling deployment: $DEPLOY_ID"
          ATTEMPTS=0
          MAX_ATTEMPTS=40
          while [ "$ATTEMPTS" -lt "$MAX_ATTEMPTS" ]; do
            PHASE=$(doctl apps get-deployment $FE_STAGING_APP_ID $DEPLOY_ID --format Phase --no-header 2>/dev/null)
            echo "  Attempt $ATTEMPTS/$MAX_ATTEMPTS -- phase: $PHASE"
            if [ "$PHASE" = "ACTIVE" ]; then
              echo "Deployment succeeded."
              break
            elif [ "$PHASE" = "ERROR" ] || [ "$PHASE" = "CANCELED" ]; then
              echo "Deployment failed with phase: $PHASE"
              DEPLOY_STATUS=failure
              break
            fi
            sleep 15
            ATTEMPTS=$((ATTEMPTS + 1))
          done
          if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
            echo "Deployment wait timed out after $((MAX_ATTEMPTS * 15))s"
            DEPLOY_STATUS=failure
          fi
        fi
      - echo "$DEPLOY_STATUS" > deploy_status.txt
    artifacts:
      - deploy_status.txt
```

The only difference from the backend deploy step is the variable name (`FE_STAGING_APP_ID`
instead of `STAGING_APP_ID`) and the tmp file names (`live-fe-staging` instead of
`live-staging`). The polling logic, timing, and phase names are identical.

### 3.6 deploy-prod step

```yaml
- step: &deploy-prod
    name: Deploy to Production
    deployment: production
    trigger: manual
    script:
      - set +e
      - DEPLOY_STATUS=success
      - apt-get update && apt-get install -y curl wget
      - wget -q https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
      - tar xf doctl-1.104.0-linux-amd64.tar.gz
      - mv doctl /usr/local/bin
      - doctl auth init --access-token $DO_API_TOKEN
      - export IMAGE_TAG="prod-${BITBUCKET_COMMIT:0:7}"
      - doctl apps spec get $FE_PROD_APP_ID > /tmp/live-fe-prod.yaml
      - |
        sed "s/tag: prod-[a-z0-9]*/tag: ${IMAGE_TAG}/g" /tmp/live-fe-prod.yaml > /tmp/live-fe-prod-pinned.yaml
      - echo "Pinned image tags to ${IMAGE_TAG}:"
      - 'grep "tag: prod" /tmp/live-fe-prod-pinned.yaml'
      - doctl apps update $FE_PROD_APP_ID --spec /tmp/live-fe-prod-pinned.yaml
      - UPDATE_EXIT_CODE=$?
      - rm -f /tmp/live-fe-prod.yaml /tmp/live-fe-prod-pinned.yaml
      - |
        if [ "$UPDATE_EXIT_CODE" -ne 0 ]; then
          DEPLOY_STATUS=failure
        fi
      - |
        if [ "$DEPLOY_STATUS" = "success" ]; then
          echo "Waiting for deployment to be created..."
          sleep 15
          DEPLOY_ID=$(doctl apps list-deployments $FE_PROD_APP_ID --format ID --no-header 2>/dev/null | head -1)
          echo "Polling deployment: $DEPLOY_ID"
          ATTEMPTS=0
          MAX_ATTEMPTS=40
          while [ "$ATTEMPTS" -lt "$MAX_ATTEMPTS" ]; do
            PHASE=$(doctl apps get-deployment $FE_PROD_APP_ID $DEPLOY_ID --format Phase --no-header 2>/dev/null)
            echo "  Attempt $ATTEMPTS/$MAX_ATTEMPTS -- phase: $PHASE"
            if [ "$PHASE" = "ACTIVE" ]; then
              echo "Deployment succeeded."
              break
            elif [ "$PHASE" = "ERROR" ] || [ "$PHASE" = "CANCELED" ]; then
              echo "Deployment failed with phase: $PHASE"
              DEPLOY_STATUS=failure
              break
            fi
            sleep 15
            ATTEMPTS=$((ATTEMPTS + 1))
          done
          if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
            echo "Deployment wait timed out after $((MAX_ATTEMPTS * 15))s"
            DEPLOY_STATUS=failure
          fi
        fi
      - echo "$DEPLOY_STATUS" > deploy_status.txt
    artifacts:
      - deploy_status.txt
```

### 3.7 smoke-test-staging step

```yaml
- step: &smoke-test-staging
    name: Smoke Test (staging)
    script:
      - set +e
      - apt-get update && apt-get install -y curl
      - echo "Waiting for staging frontend to become ready..."
      - ATTEMPTS=0
      - MAX_ATTEMPTS=30
      - SMOKE_STATUS=success
      - |
        until curl -sf "https://staging-frontend.ondigitalocean.app/" > /dev/null 2>&1; do
          ATTEMPTS=$((ATTEMPTS + 1))
          if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
            echo "Staging health check timed out after $((MAX_ATTEMPTS * 10))s"
            SMOKE_STATUS=failure
            break
          fi
          echo "Attempt $ATTEMPTS/$MAX_ATTEMPTS — waiting 10s..."
          sleep 10
        done
      - if [ "$SMOKE_STATUS" = "success" ]; then
          echo "Staging frontend is healthy";
          curl -sf -o /dev/null -w "HTTP %{http_code}" "https://staging-frontend.ondigitalocean.app/";
        fi
      - echo "$SMOKE_STATUS" > smoke_status.txt
    artifacts:
      - smoke_status.txt
```

Frontend smoke test URL pattern differences from the backend:

- The backend hits `/api/health` which returns a JSON body and a non-200 status fails
  the curl. The frontend has no `/api/health` endpoint by default.
- Use the root path `/` for the initial smoke test. A `curl -sf` against `/` will succeed
  on any HTTP 2xx response from the Next.js server, which is sufficient to confirm the
  container started and is serving traffic.
- If the app has a dedicated healthcheck route (e.g. `src/app/api/health/route.ts` in the
  App Router), use that path instead: `https://staging-frontend.ondigitalocean.app/api/health`
  This is the recommended approach — add it and use it, it matches the backend convention.
- The `-o /dev/null -w "HTTP %{http_code}"` flag on the final curl prints the status code
  to the log without dumping the full HTML page, which would make the log unreadable.
- Replace `staging-frontend.ondigitalocean.app` with your actual DO staging app domain.
  Hard-code it for staging (same as the backend does). For prod, use doctl to resolve the
  live URL dynamically (see smoke-test-prod below).

### 3.8 smoke-test-prod step

```yaml
- step: &smoke-test-prod
    name: Smoke Test (prod)
    script:
      - set +e
      - apt-get update && apt-get install -y curl wget
      - wget -q https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
      - tar xf doctl-1.104.0-linux-amd64.tar.gz
      - mv doctl /usr/local/bin
      - doctl auth init --access-token $DIGITALOCEAN_ACCESS_TOKEN
      - PROD_URL=$(doctl apps get $FE_PROD_APP_ID --format LiveURL --no-header)
      - 'echo "Resolved prod URL: $PROD_URL"'
      - echo "Waiting for production frontend to become ready..."
      - ATTEMPTS=0
      - MAX_ATTEMPTS=30
      - SMOKE_STATUS=success
      - |
        until curl -sf "${PROD_URL}/" > /dev/null 2>&1; do
          ATTEMPTS=$((ATTEMPTS + 1))
          if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
            echo "Production health check timed out after $((MAX_ATTEMPTS * 10))s"
            SMOKE_STATUS=failure
            break
          fi
          echo "Attempt $ATTEMPTS/$MAX_ATTEMPTS — waiting 10s..."
          sleep 10
        done
      - if [ "$SMOKE_STATUS" = "success" ]; then
          echo "Production frontend is healthy";
          curl -sf -o /dev/null -w "HTTP %{http_code}" "${PROD_URL}/";
        fi
      - echo "$SMOKE_STATUS" > smoke_status.txt
    artifacts:
      - smoke_status.txt
```

Note the `echo "Resolved prod URL: $PROD_URL"` line is wrapped in single quotes in the
YAML list (`'echo ...'`). This is required because the string contains `: ` (colon-space)
which YAML would otherwise interpret as a mapping key. See Section 5 for the full gotchas
list.

### 3.9 notify-slack-staging step

```yaml
- step: &notify-slack-staging
    name: Send alert to Slack
    script:
      - TEST_STATUS=unknown
      - BUILD_STATUS=unknown
      - DEPLOY_STATUS=unknown
      - SMOKE_STATUS=unknown
      - "[ -f test_status.txt ] && TEST_STATUS=$(cat test_status.txt)"
      - "[ -f build_status.txt ] && BUILD_STATUS=$(cat build_status.txt)"
      - "[ -f deploy_status.txt ] && DEPLOY_STATUS=$(cat deploy_status.txt)"
      - "[ -f smoke_status.txt ] && SMOKE_STATUS=$(cat smoke_status.txt)"
      - |
        icon() { if [ "$1" = "success" ]; then printf "✅"; else printf "❌"; fi; }
        TEST_ICON=$(icon "$TEST_STATUS")
        BUILD_ICON=$(icon "$BUILD_STATUS")
        DEPLOY_ICON=$(icon "$DEPLOY_STATUS")
        SMOKE_ICON=$(icon "$SMOKE_STATUS")
        if [ "$TEST_STATUS" = "failure" ] || [ "$BUILD_STATUS" = "failure" ] || [ "$DEPLOY_STATUS" = "failure" ] || [ "$SMOKE_STATUS" = "failure" ]; then
          OVERALL="❌ FAILED"
        else
          OVERALL="✅ SUCCESS"
        fi
        NOTIFY_MESSAGE=$(printf "[STAGING] Unibexs Frontend — %s\nTests: %s  |  Build: %s  |  Deploy: %s  |  Smoke: %s\nBranch: %s" \
          "$OVERALL" "$TEST_ICON" "$BUILD_ICON" "$DEPLOY_ICON" "$SMOKE_ICON" "$BITBUCKET_BRANCH")
        export NOTIFY_MESSAGE
      - pipe: atlassian/slack-notify:2.3.1
        variables:
          WEBHOOK_URL: $WEBHOOK_URL
          MESSAGE: "$NOTIFY_MESSAGE"
```

The only change from the backend is `Unibexs Frontend` in the printf format string.
The status file names, the icon function, and the pipe reference are identical. This
ensures Slack messages from both services are visually consistent.

### 3.10 notify-slack-prod step

```yaml
- step: &notify-slack-prod
    name: Send alert to Slack
    script:
      - TEST_STATUS=unknown
      - BUILD_STATUS=unknown
      - DEPLOY_STATUS=unknown
      - SMOKE_STATUS=unknown
      - "[ -f test_status.txt ] && TEST_STATUS=$(cat test_status.txt)"
      - "[ -f build_status.txt ] && BUILD_STATUS=$(cat build_status.txt)"
      - "[ -f deploy_status.txt ] && DEPLOY_STATUS=$(cat deploy_status.txt)"
      - "[ -f smoke_status.txt ] && SMOKE_STATUS=$(cat smoke_status.txt)"
      - |
        icon() { if [ "$1" = "success" ]; then printf "✅"; else printf "❌"; fi; }
        TEST_ICON=$(icon "$TEST_STATUS")
        BUILD_ICON=$(icon "$BUILD_STATUS")
        DEPLOY_ICON=$(icon "$DEPLOY_STATUS")
        SMOKE_ICON=$(icon "$SMOKE_STATUS")
        if [ "$TEST_STATUS" = "failure" ] || [ "$BUILD_STATUS" = "failure" ] || [ "$DEPLOY_STATUS" = "failure" ] || [ "$SMOKE_STATUS" = "failure" ]; then
          OVERALL="❌ FAILED"
        else
          OVERALL="✅ SUCCESS"
        fi
        NOTIFY_MESSAGE=$(printf "[PROD] Unibexs Frontend — %s\nTests: %s  |  Build: %s  |  Deploy: %s  |  Smoke: %s\nBranch: %s" \
          "$OVERALL" "$TEST_ICON" "$BUILD_ICON" "$DEPLOY_ICON" "$SMOKE_ICON" "$BITBUCKET_BRANCH")
        export NOTIFY_MESSAGE
      - pipe: atlassian/slack-notify:2.3.1
        variables:
          WEBHOOK_URL: $WEBHOOK_URL
          MESSAGE: "$NOTIFY_MESSAGE"
```

---

## 4. Full pipelines: section

Paste this verbatim at the bottom of the file, after all `definitions:` anchors.

```yaml
pipelines:
  branches:
    release/staging:
      - step: *test
      - step: *build-and-push-staging
      - step: *deploy-staging
      - step: *smoke-test-staging
      - step: *notify-slack-staging

    release/prod:
      - step: *test
      - step: *build-and-push-prod
      - step: *deploy-prod
      - step: *smoke-test-prod
      - step: *notify-slack-prod

    main:
      - step: *test
      - step:
          name: Send alert to Slack
          script:
            - TEST_STATUS=unknown
            - "[ -f test_status.txt ] && TEST_STATUS=$(cat test_status.txt)"
            - |
              if [ "$TEST_STATUS" = "failure" ]; then
                STATUS="FAILED ❌"
                MESSAGE="Tests: $TEST_STATUS"
              else
                STATUS="SUCCESS ✅"
                MESSAGE="All steps passed"
              fi
            - pipe: atlassian/slack-notify:2.3.1
              variables:
                WEBHOOK_URL: $WEBHOOK_URL
                MESSAGE: >
                  [main] Unibexs Frontend
                  Status: $STATUS
                  $MESSAGE
                  Branch: $BITBUCKET_BRANCH
```

---

## 5. Next.js Dockerfile Pattern

The backend Dockerfile uses a single-stage build. For Next.js you MUST use a multi-stage
build to keep the production image small. The key requirement is that `NEXT_PUBLIC_*` build
args must be declared and consumed at build time, before `npm run build`.

```dockerfile
# Stage 1: dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: builder
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for NEXT_PUBLIC_* vars — must be declared here to be available
# to `next build`. These end up in the browser bundle, not in the image env.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Stage 3: runner (production image)
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN useradd -m -u 1000 appuser

COPY --from=builder --chown=appuser:appuser /app/public ./public
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

CMD ["node", "server.js"]
```

Required `next.config.js` (or `next.config.ts`) change for the standalone output:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}
module.exports = nextConfig
```

Without `output: 'standalone'` the runner stage will not have a `server.js` and the
container will fail to start.

The health endpoint referenced in the HEALTHCHECK must exist. Create it at
`src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}
```

This makes the smoke test path `/api/health` consistent with the backend convention.

---

## 6. Bitbucket YAML Gotchas — Complete Reference

These are the exact failure modes that have already caused real parse errors or silent
misbehaviour in the backend pipeline. Read every one before writing a single line of YAML.

---

### Gotcha 1: Comments after a `|` block scalar break the parse

A `|` block scalar collects every indented line that follows it. A comment placed between
the end of the block and the next `- ` list item is treated as content — it creates a
phantom null item and Bitbucket rejects the file with a confusing parse error.

BAD — this will fail:
```yaml
        script:
          - |
            echo "hello"
          # This comment seems harmless but it is INSIDE the list, not in the block.
          # Bitbucket sees a null item here and errors.
          - echo "world"
```

GOOD — put comments before the `|` line or inside the block:
```yaml
        script:
          # This comment is safe: it precedes the block scalar item.
          - |
            # This comment is also safe: it is inside the block.
            echo "hello"
          - echo "world"
```

Rule: never place a bare `# comment` line between two `- ` items when the preceding item
used a `|` block scalar.

---

### Gotcha 2: `: ` (colon-space) inside an unquoted scalar is parsed as a YAML mapping

Any `- some text: more text` line is parsed by YAML as a mapping (`some text` -> `more
text`), not as a shell command string. This causes silent failures or parse errors.

BAD — YAML parses `Resolved prod URL` as a mapping key:
```yaml
          - echo "Resolved prod URL: $PROD_URL"
```

GOOD — wrap the entire item in single quotes:
```yaml
          - 'echo "Resolved prod URL: $PROD_URL"'
```

The existing backend pipeline already uses this pattern on line 184:
```yaml
          - 'echo "Resolved prod URL: $PROD_URL"'
```

Rule: if a `- ` list item contains `: ` (colon followed by a space) anywhere in the
string, wrap the entire item in single quotes. The inner double quotes are preserved.
This applies to echo statements, grep patterns, curl headers, and any other commands.

Common places this appears in pipeline files:
- `echo "Key: Value"` — always wrap
- `grep "tag: staging"` — always wrap (the backend does this correctly)
- `curl -H "Content-Type: application/json"` — always wrap
- `echo "Attempt $A/$B — phase: $PHASE"` — wrap if outside a `|` block

Inside a `|` block scalar you do NOT need to quote because the block is already a literal
string, not a YAML mapping node. The colon-space rule only applies to plain scalars in a
sequence (list items that start with `- `).

---

### Gotcha 3: em dashes in plain scalars

An em dash `—` (U+2014) copied from documentation, a design tool, or a Markdown file
into a plain scalar can cause a parse error in some YAML parsers, including Bitbucket's.

BAD (em dash copied from docs):
```yaml
          - echo "Step 1 — running tests"
```

GOOD — use a regular hyphen-minus or wrap in quotes:
```yaml
          - echo "Step 1 - running tests"
          - 'echo "Step 1 — running tests"'   # also fine if quoted
```

Inside a `|` block scalar em dashes are safe because the block is treated as a literal
string. The risk is only in unquoted plain scalars.

---

### Gotcha 4: YAML anchors must be defined before they are referenced

The `definitions:` section at the top of the file is where all `&anchor` definitions
live. The `pipelines:` section at the bottom references them with `*anchor`. If you
define an anchor inside the `pipelines:` section and then try to reference it, or define
it after first use, Bitbucket will error with "unknown alias".

GOOD structure:
```yaml
definitions:
  steps:
    - step: &my-step       # definition
        name: My Step
        script:
          - echo "hi"

pipelines:
  branches:
    main:
      - step: *my-step     # reference — this is valid
```

---

### Gotcha 5: `set +e` must be the FIRST script line in every step

Bitbucket pipelines run with `set -e` by default, meaning any command that returns a
non-zero exit code immediately terminates the step and marks it as failed. This defeats
the status-file pattern, which requires that the step continue running even after a
failing command so it can write the status file and let the Slack notify step read it.

`set +e` MUST be the first item in the `script:` list. If it appears after even one
command that might fail, you have lost the protection it provides.

BAD:
```yaml
        script:
          - npm ci
          - set +e        # too late — npm ci failure already killed the step
          - npm test
```

GOOD:
```yaml
        script:
          - set +e        # first line, always
          - TEST_STATUS=success
          - npm ci
          - ...
```

---

### Gotcha 6: Artifact files must be declared in every step that writes them

A step can only pass files to the next step through the `artifacts:` block. If you write
`deploy_status.txt` in the deploy step but forget to declare it under `artifacts:`, the
Slack notify step will find no file, read `unknown`, and report incorrectly.

Every status file must appear in `artifacts:` of the step that creates it:

```yaml
        artifacts:
          - test_status.txt
          - test-reports/**
```

Glob patterns (`**`) are supported. Use them for report directories.

---

### Gotcha 7: The status file pattern requires capturing exit codes immediately

The pattern only works if you capture `$?` in the very next line after the command.
Any command run between the failing command and the `$?` capture will overwrite `$?`.

BAD — the echo overwrites `$?`:
```yaml
          - npm test
          - echo "tests done"
          - TEST_EXIT_CODE=$?     # captures echo's exit code (0), not npm test's
```

GOOD:
```yaml
          - npm test
          - TEST_EXIT_CODE=$?
          - echo "tests done"
          - if [ "$TEST_EXIT_CODE" -ne 0 ]; then TEST_STATUS=failure; fi
```

---

### Gotcha 8: Single-quoted strings cannot contain single quotes

YAML single-quoted strings treat `''` (two single quotes) as an escaped single quote.
If you try to use a literal single quote inside a single-quoted item, you will get a
parse error or unexpected behaviour.

If your command contains a single quote (e.g. `it's`), either use a `|` block scalar or
double-quote the YAML item and escape the inner double quotes.

---

### Gotcha 9: `>` (folded scalar) collapses newlines — use `|` for multiline shell

The `>` folded scalar joins continuation lines with spaces, not newlines. This is fine
for long single commands (like the `docker build` invocation in the backend) but will
break multiline shell if you use it expecting newlines between statements.

Use `|` for any block that contains multiple shell statements, conditionals, or loops.
Use `>` only for a single command that is split across lines purely for readability.

---

## 7. Summary of Differences: Backend vs Frontend Pipeline

| Concern                  | Backend                          | Frontend                              |
|--------------------------|----------------------------------|---------------------------------------|
| Image                    | `python:3.8` / uv slim           | `node:20-slim`                        |
| Test runner              | `uv run pytest`                  | `npx vitest run` or `npx jest`        |
| Dependency install       | `uv sync`                        | `npm ci`                              |
| Registry repo (staging)  | `unibexs-backend-staging`        | `unibexs-frontend-staging`            |
| Registry repo (prod)     | `unibexs-backend-prod`           | `unibexs-frontend-prod`               |
| App ID variables         | `STAGING_APP_ID`, `PROD_APP_ID`  | `FE_STAGING_APP_ID`, `FE_PROD_APP_ID` |
| Build args               | None                             | `--build-arg NEXT_PUBLIC_API_URL=...` |
| Extra .env removal       | 5 files                          | 7 files (adds `.production`, `.development`) |
| Smoke test path          | `/api/health` (JSON)             | `/api/health` (Next.js route handler) |
| Smoke test final curl    | dumps response body              | `-o /dev/null -w "HTTP %{http_code}"` |
| Dockerfile style         | Single-stage                     | Multi-stage (deps / builder / runner) |
| next.config              | N/A                              | `output: 'standalone'` required       |

Everything else — the `set +e` pattern, status files, image tag format, pull-edit-push
deploy, polling loop, artifact declarations, and Slack notify steps — is identical between
backend and frontend. Keep it that way.