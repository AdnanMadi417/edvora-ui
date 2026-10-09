import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { jwtVerify } from "jose";

/**
 * Receives best-effort client events (see lib/clientTelemetry.ts) and emits
 * them as OpenTelemetry log records, which the Node instrumentation exports
 * to SigNoz. Unauthenticated by design (it must work when the session check
 * itself is failing), so input is allowlisted, capped and throttled here.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = new Set(["auth_guard_error_state", "auth_loop_breaker_tripped"]);
const MAX_BODY_BYTES = 2048;
const MAX_ATTRIBUTES = 12;
const MAX_KEY_LENGTH = 40;
const MAX_VALUE_LENGTH = 200;

const THROTTLE_WINDOW_MS = 60_000;
const PER_IP_LIMIT = 30;
const GLOBAL_LIMIT = 600;
const MAX_TRACKED_IPS = 5_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, Bucket>();
const globalBucket: Bucket = { count: 0, resetAt: 0 };

function take(bucket: Bucket, limit: number, now: number): boolean {
  if (now >= bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + THROTTLE_WINDOW_MS;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

function takeForIp(ip: string, now: number): boolean {
  if (ipBuckets.size > MAX_TRACKED_IPS) {
    for (const [key, bucket] of ipBuckets) {
      if (now >= bucket.resetAt) ipBuckets.delete(key);
    }
    if (ipBuckets.size > MAX_TRACKED_IPS) ipBuckets.clear();
  }
  let bucket = ipBuckets.get(ip);
  if (!bucket) {
    bucket = { count: 0, resetAt: 0 };
    ipBuckets.set(ip, bucket);
  }
  return take(bucket, PER_IP_LIMIT, now);
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

type Primitive = string | number | boolean;

type TokenState = "ok" | "missing" | "invalid" | "unverifiable";

// Who sent the event, from the session cookie the browser attaches to this
// same-origin request. The signature is checked with the same secret the
// middleware uses, so `enduser.id` in the log is the real user id (the
// token's `sub`), not something the client typed. The client-supplied
// `*_hint` attributes are kept separately and are not verified.
async function verifiedUser(req: NextRequest): Promise<{ id: string | null; token: TokenState }> {
  const token = req.cookies.get("token")?.value;
  if (!token) return { id: null, token: "missing" };
  const secret = process.env.AUTH_SECRET_KEY;
  if (!secret) return { id: null, token: "unverifiable" };
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.sub === "string" && payload.sub ? { id: payload.sub, token: "ok" } : { id: null, token: "invalid" };
  } catch {
    return { id: null, token: "invalid" };
  }
}

function sanitizeAttributes(input: unknown): Record<string, Primitive> {
  const out: Record<string, Primitive> = {};
  if (!input || typeof input !== "object") return out;
  let count = 0;
  for (const [rawKey, value] of Object.entries(input as Record<string, unknown>)) {
    if (count >= MAX_ATTRIBUTES) break;
    const key = rawKey.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, MAX_KEY_LENGTH);
    if (!key) continue;
    if (typeof value === "string") out[key] = value.slice(0, MAX_VALUE_LENGTH);
    else if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    else if (typeof value === "boolean") out[key] = value;
    else continue;
    count += 1;
  }
  return out;
}

export async function POST(req: NextRequest) {
  const now = Date.now();
  if (!take(globalBucket, GLOBAL_LIMIT, now)) {
    return NextResponse.json({ error: "throttled" }, { status: 429 });
  }
  const ip = clientIp(req);
  if (!takeForIp(ip, now)) {
    return NextResponse.json({ error: "throttled" }, { status: 429 });
  }

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }

  let body: { name?: unknown; attributes?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const name = typeof body?.name === "string" ? body.name : "";
  if (!ALLOWED_EVENTS.has(name)) {
    return NextResponse.json({ error: "unknown event" }, { status: 400 });
  }

  const attributes = sanitizeAttributes(body.attributes);
  const user = await verifiedUser(req);
  const record: Record<string, Primitive> = {
    "event.name": name,
    "client.ip": ip,
    "user_agent.original": (req.headers.get("user-agent") ?? "").slice(0, MAX_VALUE_LENGTH),
    "auth.token": user.token,
    ...(user.id ? { "enduser.id": user.id } : {}),
    ...Object.fromEntries(Object.entries(attributes).map(([k, v]) => [`client.${k}`, v])),
  };

  console.warn("[client-event] %s %j", name, record);
  logs.getLogger(process.env.SIGNOZ_SERVICE_NAME ?? "unibexs-frontend").emit({
    severityNumber: SeverityNumber.WARN,
    severityText: "WARN",
    body: `[client-event] ${name}`,
    attributes: record,
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
