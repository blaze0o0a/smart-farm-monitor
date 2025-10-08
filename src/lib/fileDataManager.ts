import fs from 'fs'
import path from 'path'
import { SensorData } from '@/types/sensor'

// 데이터 파일 경로
const DATA_DIR = path.join(process.cwd(), 'data')
const FARM_DATA_FILE = path.join(DATA_DIR, 'farm-data.json')

// farm-data.json에서 모든 데이터 읽기
export function readAllFarmData(): SensorData[] {
  try {
    if (!fs.existsSync(FARM_DATA_FILE)) {
      return []
    }

    const fileContent = fs.readFileSync(FARM_DATA_FILE, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error reading farm-data.json:', error)
    return []
  }
}

// 날짜 범위의 데이터 읽기
export function readDataFromDateRange(
  startDate: string,
  endDate: string
): SensorData[] {
  const allData = readAllFarmData()
  const start = new Date(startDate)
  const end = new Date(endDate)

  return allData.filter((item: SensorData) => {
    const itemDate = new Date(item.time)
    return itemDate >= start && itemDate <= end
  })
}

// 최근 N일 데이터 읽기
export function readRecentData(days: number = 1): SensorData[] {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days + 1)

  return readDataFromDateRange(startDate.toISOString(), endDate.toISOString())
}

// 특정 날짜의 데이터가 있는지 확인
export function hasDataForDate(date: string): boolean {
  const allData = readAllFarmData()

  return allData.some((item: SensorData) => {
    const itemDate = new Date(item.time)
    return itemDate.toISOString().split('T')[0] === date
  })
}

// 사용 가능한 날짜 목록 가져오기
export function getAvailableDates(): string[] {
  const allData = readAllFarmData()
  const dates = new Set<string>()

  allData.forEach((item: SensorData) => {
    const date = new Date(item.time).toISOString().split('T')[0]
    dates.add(date)
  })

  return Array.from(dates).sort()
}
