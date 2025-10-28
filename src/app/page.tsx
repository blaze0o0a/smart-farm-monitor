/**
 * @fileoverview 대시보드 메인 페이지
 * @description 실시간 센서 모니터링 대시보드 메인 페이지
 * @module app/page
 */

'use client'

import React, { useEffect, useState } from 'react'
import GrafanaStyleDashboard from '@/components/dashboard/GrafanaStyleDashboard'
import { useSidebar } from '@/components/AppWrapper'
import { useDashboardData, useRealtimeData } from '@/hooks/useSocketData'
import { ChartDataPoint } from '@/types/sensor'

/**
 * 대시보드 메인 페이지 컴포넌트
 * @description 실시간 센서 데이터를 Grafana 스타일 대시보드로 표시
 * @returns {JSX.Element} 대시보드 UI
 */
export default function Dashboard() {
  const { isSidebarOpen } = useSidebar()
  const { data: dashboardData, error } = useDashboardData()
  const { latestData } = useRealtimeData()
  const [realtimeData, setRealtimeData] = useState<ChartDataPoint[]>([])

  // 실시간 데이터를 차트 데이터에 추가
  useEffect(() => {
    if (latestData) {
      const newChartPoint: ChartDataPoint = {
        time: latestData.time,
        temperature: latestData.temperature,
        humidity: latestData.humidity,
        ec: latestData.ec,
        ph: latestData.ph,
        n: latestData.n,
        p: latestData.p,
        k: latestData.k,
      }

      setRealtimeData((prev) => {
        const updated = [...prev, newChartPoint]
        // 최근 12시간 데이터만 유지 (슬라이딩 윈도우)
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
        return updated.filter((item) => new Date(item.time) > twelveHoursAgo)
      })
    }
  }, [latestData])

  // 초기 데이터 로드
  useEffect(() => {
    if (dashboardData && dashboardData.length > 0) {
      setRealtimeData(dashboardData)
    }
  }, [dashboardData])

  // 실시간 데이터와 초기 데이터를 결합
  const combinedData = realtimeData.length > 0 ? realtimeData : dashboardData

  if (error) {
    console.error('대시보드 데이터 오류:', error)
  }

  return (
    <GrafanaStyleDashboard
      dashboardData={combinedData}
      isSidebarOpen={isSidebarOpen}
    />
  )
}
