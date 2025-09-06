import { registerOTel, OTLPHttpJsonTraceExporter } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "your-project-name",
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
  });
}