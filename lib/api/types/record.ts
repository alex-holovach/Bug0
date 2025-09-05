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
