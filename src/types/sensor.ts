export interface ChartDataPoint {
  time: string
  [key: string]: string | number
}

export interface SensorData {
  temperature: number
  humidity: number
  ec: number
  ph: number
  n: number
  p: number
  k: number
  time?: string
}

export interface TableDataRow {
  time: string
  temperature: number
  humidity: number
  ec: number
  ph: number
  n: number
  p: number
  k: number
}

export interface CalibrationData {
  [key: string]: number
}

export interface SensorConfig {
  title: string
  value: number | null
  unit: string
  icon: string
  iconAlt: string
  dataKey: string
  color: string
}

export interface CalibrationItem {
  key: string
  label: string
  unit: string
  iconKey: string
}
