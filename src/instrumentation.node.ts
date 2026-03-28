/**
 * Node-only OpenTelemetry bootstrap for Next.js instrumentation.
 */

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
    process.env.NEXT_PUBLIC_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development';

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
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
      headers: authHeaders,
    }),
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
