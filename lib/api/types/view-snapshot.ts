export interface ViewSnapshotStat {
  id: number;
  viewId: string | number;
  timestamp: string;
  errorsCount: number;
  warningsCount: number;
  requestsCount: number;
}
