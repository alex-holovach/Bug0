import { ViewRecord } from './record';
export interface ViewState {
  records: ViewRecord[];
  organizationId: string;
  positions: { [key: string]: { x: number; y: number } };
}
