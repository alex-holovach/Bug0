export interface SystemEvent {
  timestamp: string; // ISO format date string
  type: string;
  component: string;
  message: string;
}
