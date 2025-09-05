export interface ResourceAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface TraceSpan {
  timestamp: string;
  traceId: string;
  spanId: string;
  parentSpanId: string;
  traceState: string;
  spanName: string;
  spanKind: string;
  serviceName: string;
  resourceAttributes: ResourceAttributes;
  scopeName: string;
  scopeVersion: string;
  spanAttributes: SpanAttributes;
  duration: number;
  statusCode: string;
  statusMessage: string;
}
