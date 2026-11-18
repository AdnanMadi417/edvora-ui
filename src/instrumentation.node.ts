/**
 * Node-only OpenTelemetry bootstrap for Next.js instrumentation.
 */

import type { Context } from '@opentelemetry/api';
import type { ReadableSpan, Span, SpanProcessor } from '@opentelemetry/sdk-trace-base';

// Query params that must never leave this process in trace data — invitation
// tokens (/team/accept-invite?token=...), OTP codes, and email addresses
// (/team/verify-otp, /auth/staff-invitation) are all bearer-credential-grade
// or PII and end up verbatim in http.target/url.full/etc. attributes unless
// redacted here before export.
const SENSITIVE_QUERY_PARAMS = ['token', 'otp', 'email'];

function redactSensitiveQueryParams(value: string): string {
  const qIndex = value.indexOf('?');
  if (qIndex === -1) return value;

  const base = value.slice(0, qIndex);
  const params = new URLSearchParams(value.slice(qIndex + 1));
  let redacted = false;
  for (const key of SENSITIVE_QUERY_PARAMS) {
    if (params.has(key)) {
      params.set(key, '[REDACTED]');
      redacted = true;
    }
  }
  return redacted ? `${base}?${params.toString()}` : value;
}

// Scans every string attribute on a span (regardless of which instrumentation
// set it, or which semconv attribute name it used — http.target, http.url,
// url.full, url.path, etc.) and redacts any sensitive query params found.
function redactSpanAttributes(span: ReadableSpan): void {
  const attributes = span.attributes as Record<string, unknown>;
  for (const key of Object.keys(attributes)) {
    const value = attributes[key];
    if (typeof value === 'string' && value.includes('?')) {
      const redacted = redactSensitiveQueryParams(value);
      if (redacted !== value) attributes[key] = redacted;
    }
  }
}

class RedactingSpanProcessor implements SpanProcessor {
  constructor(private readonly next: SpanProcessor) {}
  onStart(span: Span, parentContext: Context): void {
    this.next.onStart(span, parentContext);
  }
  onEnd(span: ReadableSpan): void {
    redactSpanAttributes(span);
    this.next.onEnd(span);
  }
  forceFlush(): Promise<void> {
    return this.next.forceFlush();
  }
  shutdown(): Promise<void> {
    return this.next.shutdown();
  }
}

let started = false;

async function startOtel() {
  if (started) return;
  started = true;

  const endpoint = process.env.SIGNOZ_ENDPOINT;
  console.log(
    '[OTel] register() called, NEXT_RUNTIME=%s, SIGNOZ_ENDPOINT=%s',
    process.env.NEXT_RUNTIME,
    endpoint ? '(set)' : '(missing)',
  );
  if (!endpoint) return;

  const ingestionKey = process.env.SIGNOZ_INGESTION_KEY ?? '';
  const serviceName = process.env.SIGNOZ_SERVICE_NAME ?? 'unibexs-frontend';
  const environment =
    process.env.ENVIRONMENT ??
    process.env.NEXT_PUBLIC_ENVIRONMENT ??
    process.env.NODE_ENV ??
    'development';

  if (!ingestionKey) {
    console.warn('[OTel] SIGNOZ_INGESTION_KEY is missing. Exports will likely be rejected.');
  }

  const authHeaders = { 'signoz-access-token': ingestionKey };

  const { NodeSDK } = await import('@opentelemetry/sdk-node');
  const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
  const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http');
  const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-http');
  const { resourceFromAttributes } = await import('@opentelemetry/resources');
  const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');
  const { BatchLogRecordProcessor } = await import('@opentelemetry/sdk-logs');
  const { BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
  const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http');
  const { UndiciInstrumentation } = await import('@opentelemetry/instrumentation-undici');
  const { logs: otelLogs, SeverityNumber } = await import('@opentelemetry/api-logs');

  const resource = resourceFromAttributes({
    'service.name': serviceName,
    'service.version': '0.1.0',
    'deployment.environment': environment,
  });

  const sdk = new NodeSDK({
    resource,
    // Routed through RedactingSpanProcessor rather than passed as
    // `traceExporter` directly, so sensitive query params are stripped from
    // every span's attributes before they're batched for export.
    spanProcessors: [
      new RedactingSpanProcessor(
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: `${endpoint}/v1/traces`,
            headers: authHeaders,
          }),
        ),
      ),
    ],
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${endpoint}/v1/metrics`,
        headers: authHeaders,
      }),
      exportIntervalMillis: 60_000,
    }),
    logRecordProcessors: [
      new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: `${endpoint}/v1/logs`,
          headers: authHeaders,
        }),
      ),
    ],
    instrumentations: [new HttpInstrumentation(), new UndiciInstrumentation()],
  });

  sdk.start();
  console.log('[OTel] SDK started. Exporting to %s, service=%s', endpoint, serviceName);

  const logger = otelLogs.getLogger(serviceName);

  const emitError = (err: unknown, origin: string) => {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
      body: `[${origin}] ${error.message}`,
      attributes: {
        'exception.type': error.name,
        'exception.message': error.message,
        'exception.stacktrace': error.stack ?? '',
        'error.origin': origin,
      },
    });
  };

  process.on('unhandledRejection', (reason) => {
    emitError(reason, 'unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    emitError(error, 'uncaughtException');
    sdk.shutdown().finally(() => process.exit(1));
  });

  process.on('SIGTERM', async () => {
    await sdk.shutdown().catch(console.error);
  });
}

void startOtel();

export {};

