import { SensorConfig, CalibrationItem } from '@/types/sensor'

export const SENSOR_CONFIGS: Omit<SensorConfig, 'value'>[] = [
  {
    title: 'Temperature',
    unit: '°C',
    icon: '/icons/temp_icon.png',
    iconAlt: 'temperature',
    dataKey: 'temperature',
    color: '#ff7300',
  },
  {
    title: 'Humidity',
    unit: '%',
    icon: '/icons/humi_icon.png',
    iconAlt: 'humidity',
    dataKey: 'humidity',
    color: '#0088fe',
  },
  {
    title: 'pH',
    unit: '',
    icon: '/icons/ph_icon.png',
    iconAlt: 'ph',
    dataKey: 'ph',
    color: '#00c49f',
  },
  {
    title: 'EC',
    unit: 'us/cm',
    icon: '/icons/ec_icon.png',
    iconAlt: 'ec',
    dataKey: 'ec',
    color: '#ffbb28',
  },
  {
    title: 'Nitrogen',
    unit: 'ppm',
    icon: '/icons/npk_icon.png',
    iconAlt: 'nitrogen',
    dataKey: 'n',
    color: '#ff6b6b',
  },
  {
    title: 'Phosphorus',
    unit: 'ppm',
    icon: '/icons/npk_icon.png',
    iconAlt: 'phosphorus',
    dataKey: 'p',
    color: '#4ecdc4',
  },
  {
    title: 'Potassium',
    unit: 'ppm',
    icon: '/icons/npk_icon.png',
    iconAlt: 'potassium',
    dataKey: 'k',
    color: '#45b7d1',
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
