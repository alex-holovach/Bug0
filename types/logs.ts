export type LogRecord = {
  timeUnixNano?: string
  observedTimeUnixNano?: string
  severityText?: string
  severityNumber?: number
  body?: any
  attributes?: Record<string, any>
  resourceAttributes?: Record<string, any>
}