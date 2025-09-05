export interface QueryCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

/**
 * Source configuration for a query
 */
export interface QuerySource {
  integrationId: number;
  selector: string;
  recordType: string;
  join: QuerySource[];
  condition: QueryCondition[];
}

/**
 * Request type for querying records
 */
export interface QueryRecordsRequest {
  source: QuerySource;
}
