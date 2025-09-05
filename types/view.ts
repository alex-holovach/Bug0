export interface LayoutItem {
  type: string;
  label?: string;
  value?: { data: number | string | object };
}

export interface ViewElement {
  component: string;
  color: string;
  layoutId: string;
  parentId: string;
  order: number;
  id: string;
}

export interface LayoutMetadata {
  layout: LayoutItem[];
  id: string;
}

export interface ViewDefinition {
  layouts: LayoutMetadata[];
  elements: ViewElement[];
}

export interface View {
  id: number;
  name: string;
  description: string;
  type: string;
  organizationId: string;
  metadata: ViewDefinition;
  createdAt: string;
  updatedAt: string;
  snapshotsEnabled: boolean;
  layoutType: string;
}

export interface ViewRecord extends Node {
  id: string;
  key: string;
  type: string;
  color: string;
  order: number;
  icon: string;
  component: string;
  integrationId: number;
  layout: Layout[];
  value: object;
  parentId: string;
  position: object;
}

export interface Layout {
  type: string;
  value: {
    data: string;
  };
  label: string;
}

export interface SystemEvent {
  timestamp: string; // ISO format date string
  type: string;
  component: string;
  message: string;
}

export interface ViewState {
  records: ViewRecord[];
  organizationId: string;
  positions: { [key: string]: { x: number; y: number } };
}

export interface ViewSnapshotStat {
  id: number;
  viewId: string | number;
  timestamp: string;
  errorsCount: number;
  warningsCount: number;
  requestsCount: number;
}
