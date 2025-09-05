export interface Endpoint {
  serviceName: string;
  route: string;
  avgLatencyMs: number;
  errorRate: number;
  requestCount: number;
  cloudRegion?: string;
  vercelEnvironment?: string;
}

export interface EndpointsResponse {
  data: Endpoint[];
  total: number;
}
