'use client'

import React, { useState, useEffect, useCallback } from 'react'
import GrafanaCard from '@/components/dashboard/GrafanaCard'
import { ChartDataPoint, SensorConfig } from '@/types/sensor'
import { SENSOR_CONFIGS } from '@/constants/sensors'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<ChartDataPoint[]>([])

  // 12시간 대시보드 데이터 가져오기
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('대시보드 데이터 가져오기 실패:', error)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    // 5분마다 데이터 갱신
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  // 히스토리 데이터에서 최근값을 실시간 데이터로 사용
  const realTimeData =
    dashboardData.length > 0
      ? dashboardData[dashboardData.length - 1]
      : { time: null }

  const sensorConfigs: SensorConfig[] = SENSOR_CONFIGS.map((config) => ({
    ...config,
    value: realTimeData[config.dataKey as keyof typeof realTimeData] as
      | number
      | null,
  }))

  return (
    <div className="min-h-screen bg-gray-900 p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            스마트팜 모니터링 대시보드
          </h1>
          <p className="text-gray-400 text-base">
            실시간 센서 데이터 및 12시간 트렌드
          </p>
        </div>

        {/* 센서 카드들 - 반응형 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
          {sensorConfigs.map((sensor, index) => (
            <GrafanaCard key={index} {...sensor} chartData={dashboardData} />
          ))}
        </div>

        {/* 하단 정보 */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            마지막 업데이트:{' '}
            {realTimeData.time
              ? new Date(realTimeData.time).toLocaleTimeString()
              : '--'}
          </p>
        </div>
      </div>
    </div>
  )
}
