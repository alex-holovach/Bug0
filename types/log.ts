export interface Log {
  timestamp: string;
  timestampTime: string;
  traceId: string;
  spanId: string;
  traceFlags: number;
  severityText: string;
  severityNumber: number;
  serviceName: string;
  body: string;
  resourceSchemaUrl: string;
  resourceAttributes: Record<string, any>;
  scopeSchemaUrl: string;
  scopeName: string;
  scopeVersion: string;
  scopeAttributes: Record<string, any>;
  logAttributes: Record<string, any>;
}
