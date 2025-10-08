import { SensorConfig, CalibrationItem } from '@/types/sensor'
import { SENSOR_COLORS } from './app'

export const SENSOR_CONFIGS: Omit<SensorConfig, 'value'>[] = [
  {
    title: 'Temperature',
    unit: '°C',
    icon: '/icons/temp_icon.png',
    iconAlt: 'temperature',
    dataKey: 'temperature',
    color: SENSOR_COLORS.temperature,
  },
  {
    title: 'Humidity',
    unit: '%',
    icon: '/icons/humi_icon.png',
    iconAlt: 'humidity',
    dataKey: 'humidity',
    color: SENSOR_COLORS.humidity,
  },
  {
    title: 'pH',
    unit: '',
    icon: '/icons/ph_icon.png',
    iconAlt: 'ph',
    dataKey: 'ph',
    color: SENSOR_COLORS.ph,
  },
  {
    title: 'EC',
    unit: 'us/cm',
    icon: '/icons/ec_icon.png',
    iconAlt: 'ec',
    dataKey: 'ec',
    color: SENSOR_COLORS.ec,
  },
  {
    title: 'N',
    unit: 'ppm',
    icon: '/icons/npk_icon.png',
    iconAlt: 'nitrogen',
    dataKey: 'n',
    color: SENSOR_COLORS.n,
  },
  {
    title: 'P',
    unit: 'ppm',
    icon: '/icons/npk_icon.png',
    iconAlt: 'phosphorus',
    dataKey: 'p',
    color: SENSOR_COLORS.p,
  },
  {
    title: 'K',
    unit: 'ppm',
    icon: '/icons/npk_icon.png',
    iconAlt: 'potassium',
    dataKey: 'k',
    color: SENSOR_COLORS.k,
  },
]

export const CALIBRATION_ITEMS: CalibrationItem[] = [
  { key: 'temperature', label: '온도', unit: '°C', iconKey: 'temp' },
  { key: 'humidity', label: '습도', unit: '%', iconKey: 'humi' },
  { key: 'ec', label: 'EC', unit: 'us/cm', iconKey: 'ec' },
  { key: 'ph', label: 'pH', unit: '', iconKey: 'ph' },
  { key: 'n_factor', label: 'N 계수', unit: '', iconKey: 'npk' },
  { key: 'p_factor', label: 'P 계수', unit: '', iconKey: 'npk' },
  { key: 'k_factor', label: 'K 계수', unit: '', iconKey: 'npk' },
  { key: 'n_offset', label: 'N 오프셋', unit: '', iconKey: 'npk' },
  { key: 'p_offset', label: 'P 오프셋', unit: '', iconKey: 'npk' },
  { key: 'k_offset', label: 'K 오프셋', unit: '', iconKey: 'npk' },
]
