export interface ViewSource {
  integrationId: number;
  recordType: string;
  join: ViewSource[];
  operator?: string;
  condition?: Condition[];
}

export interface Condition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

export interface Selector {
  data: string;
}

export interface LayoutItem {
  type: string;
  selector?: Selector;
  label?: string;
  value?: { data: number | string | object };
}

export interface ViewElement {
  source?: ViewSource;
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
