export interface EndpointDetailsData {
  data: Array<{
    networkFlowKey: string;
    sourceName: string;
    targetName: string;
    requestCount: number;
    errorRate: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    [key: string]: any; // For additional dynamic fields
  }>;
  total: number;
}

export interface ServiceRequestMetricsData {
  data: Array<{
    serviceKey: string;
    serviceName: string;
    requestCount: number;
    errorRate: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    [key: string]: any; // For additional dynamic fields
  }>;
  total: number;
}

export interface ServiceDetailsData {
  data: Array<{
    serviceName: string;
    serviceKey: string;
    requestCount: number;
    errorRate: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    [key: string]: any; // For additional dynamic fields
  }>;
  total: number;
}

export interface QueryResponse<T = any> {
  data: T[];
  total: number;
  results?: T[];
}
