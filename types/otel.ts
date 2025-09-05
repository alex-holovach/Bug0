// OpenTelemetry Protocol (OTLP) types for trace and log ingestion

// Common types
export interface KeyValue {
  key: string;
  value: AnyValue;
}

export interface AnyValue {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: number;
  doubleValue?: number;
  arrayValue?: ArrayValue;
  kvlistValue?: KeyValueList;
  bytesValue?: string;
}

export interface ArrayValue {
  values: AnyValue[];
}

export interface KeyValueList {
  values: KeyValue[];
}

// Resource types
export interface Resource {
  attributes: KeyValue[];
  droppedAttributesCount?: number;
}

// Instrumentation scope
export interface InstrumentationScope {
  name: string;
  version?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
}

// Trace types
export interface TraceSpan {
  traceId: string;
  spanId: string;
  traceState?: string;
  parentSpanId?: string;
  name: string;
  kind: SpanKind;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
  events?: SpanEvent[];
  droppedEventsCount?: number;
  links?: SpanLink[];
  droppedLinksCount?: number;
  status?: SpanStatus;
}

export enum SpanKind {
  SPAN_KIND_UNSPECIFIED = 0,
  SPAN_KIND_INTERNAL = 1,
  SPAN_KIND_SERVER = 2,
  SPAN_KIND_CLIENT = 3,
  SPAN_KIND_PRODUCER = 4,
  SPAN_KIND_CONSUMER = 5,
}

export interface SpanEvent {
  timeUnixNano: string;
  name: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
}

export interface SpanLink {
  traceId: string;
  spanId: string;
  traceState?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
}

export interface SpanStatus {
  message?: string;
  code: StatusCode;
}

export enum StatusCode {
  STATUS_CODE_UNSET = 0,
  STATUS_CODE_OK = 1,
  STATUS_CODE_ERROR = 2,
}

// Log types
export interface LogRecord {
  timeUnixNano: string;
  observedTimeUnixNano: string;
  severityNumber?: SeverityNumber;
  severityText?: string;
  body?: AnyValue;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
  flags?: number;
  traceId?: string;
  spanId?: string;
}

export enum SeverityNumber {
  SEVERITY_NUMBER_UNSPECIFIED = 0,
  SEVERITY_NUMBER_TRACE = 1,
  SEVERITY_NUMBER_TRACE2 = 2,
  SEVERITY_NUMBER_TRACE3 = 3,
  SEVERITY_NUMBER_TRACE4 = 4,
  SEVERITY_NUMBER_DEBUG = 5,
  SEVERITY_NUMBER_DEBUG2 = 6,
  SEVERITY_NUMBER_DEBUG3 = 7,
  SEVERITY_NUMBER_DEBUG4 = 8,
  SEVERITY_NUMBER_INFO = 9,
  SEVERITY_NUMBER_INFO2 = 10,
  SEVERITY_NUMBER_INFO3 = 11,
  SEVERITY_NUMBER_INFO4 = 12,
  SEVERITY_NUMBER_WARN = 13,
  SEVERITY_NUMBER_WARN2 = 14,
  SEVERITY_NUMBER_WARN3 = 15,
  SEVERITY_NUMBER_WARN4 = 16,
  SEVERITY_NUMBER_ERROR = 17,
  SEVERITY_NUMBER_ERROR2 = 18,
  SEVERITY_NUMBER_ERROR3 = 19,
  SEVERITY_NUMBER_ERROR4 = 20,
  SEVERITY_NUMBER_FATAL = 21,
  SEVERITY_NUMBER_FATAL2 = 22,
  SEVERITY_NUMBER_FATAL3 = 23,
  SEVERITY_NUMBER_FATAL4 = 24,
}

// Request/Response types
export interface OTLPTracesRequest {
  resourceSpans: ResourceSpans[];
}

export interface ResourceSpans {
  resource?: Resource;
  scopeSpans: ScopeSpans[];
  schemaUrl?: string;
}

export interface ScopeSpans {
  scope?: InstrumentationScope;
  spans: TraceSpan[];
  schemaUrl?: string;
}

export interface OTLPLogsRequest {
  resourceLogs: ResourceLogs[];
}

export interface ResourceLogs {
  resource?: Resource;
  scopeLogs: ScopeLogs[];
  schemaUrl?: string;
}

export interface ScopeLogs {
  scope?: InstrumentationScope;
  logRecords: LogRecord[];
  schemaUrl?: string;
}

export interface OTLPResponse {
  partialSuccess?: PartialSuccess;
}

export interface PartialSuccess {
  rejectedSpans?: number;
  rejectedLogRecords?: number;
  errorMessage?: string;
}

// Helper function to extract string value from AnyValue
export function extractStringValue(value?: AnyValue): string {
  if (!value) return '';
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.intValue !== undefined) return value.intValue.toString();
  if (value.doubleValue !== undefined) return value.doubleValue.toString();
  if (value.boolValue !== undefined) return value.boolValue.toString();
  if (value.bytesValue !== undefined) return value.bytesValue;
  if (value.kvlistValue) return JSON.stringify(value.kvlistValue);
  if (value.arrayValue) return JSON.stringify(value.arrayValue);
  return '';
}

// Helper function to convert KeyValue array to object
export function keyValuesToObject(kvs?: KeyValue[]): Record<string, any> {
  if (!kvs) return {};
  const result: Record<string, any> = {};
  for (const kv of kvs) {
    result[kv.key] = extractAnyValue(kv.value);
  }
  return result;
}

// Helper function to extract the actual value from AnyValue
export function extractAnyValue(value?: AnyValue): any {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.intValue !== undefined) return value.intValue;
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.boolValue !== undefined) return value.boolValue;
  if (value.bytesValue !== undefined) return value.bytesValue;
  if (value.kvlistValue) return keyValuesToObject(value.kvlistValue.values);
  if (value.arrayValue) return value.arrayValue.values.map(v => extractAnyValue(v));
  return null;
}
