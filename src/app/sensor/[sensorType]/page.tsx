'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import moment from 'moment'
import { SENSOR_CONFIGS } from '@/constants/sensors'
import { useSensorData } from '@/hooks/useSensorData'
import { SensorChart } from '@/components/sensor/SensorChart'
import { SensorTable } from '@/components/sensor/SensorTable'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

export default function SensorDetailPage() {
  const params = useParams()
  const sensorType = params.sensorType as string

  // 커스텀 훅을 사용하여 센서 데이터 로직 분리
  const {
    chartData,
    tableData,
    sortedData,
    currentData,
    isAnyLoading,
    startDate,
    pagination,
    sortConfig,
    handleSort,
    setPagination,
    exportToCSV,
    onDateChange,
  } = useSensorData()

  // 센서 설정 찾기
  const sensorConfig = SENSOR_CONFIGS.find(
    (config) => config.dataKey === sensorType
  )

  if (!sensorConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              센서를 찾을 수 없습니다
            </h1>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
            >
              <ArrowLeft size={16} />
              대시보드로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-slate-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-4 sm:mb-6">
          {/* 상단: 뒤로가기 + 제목 + 데스크톱용 날짜/CSV */}
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-0">
            <Link
              href="/"
              className="p-1.5 sm:p-2 hover:bg-slate-800 rounded transition-colors"
              title="대시보드로 돌아가기"
            >
              <ArrowLeft
                size={18}
                className="text-slate-400 hover:text-slate-200 sm:w-5 sm:h-5"
              />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Image
                src={sensorConfig.icon}
                alt={sensorConfig.iconAlt}
                width={20}
                height={20}
                className="object-contain sm:w-6 sm:h-6 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-semibold truncate">
                  {sensorConfig.title} 상세보기
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                  실시간 데이터 및 히스토리 분석
                </p>
              </div>
            </div>

            {/* 데스크톱: 우측 끝에 날짜 선택 + CSV 다운로드 */}
            <div className="hidden sm:flex items-center gap-4">
              <input
                type="date"
                value={moment(startDate).format('YYYY-MM-DD')}
                onChange={(e) => onDateChange(moment(e.target.value))}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100 text-base w-48"
                style={{
                  colorScheme: 'dark',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                }}
              />
              <button
                onClick={() =>
                  exportToCSV(sensorType, sensorConfig.title, sensorConfig.unit)
                }
                disabled={tableData.length === 0}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-colors text-base"
              >
                CSV 다운로드
              </button>
            </div>
          </div>

          {/* 모바일: 하단 날짜 선택 + CSV 다운로드 */}
          <div className="flex sm:hidden items-center gap-3 mt-3">
            <input
              type="date"
              value={moment(startDate).format('YYYY-MM-DD')}
              onChange={(e) => onDateChange(moment(e.target.value))}
              className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100 text-sm"
              style={{
                colorScheme: 'dark',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
              }}
            />
            <button
              onClick={() =>
                exportToCSV(sensorType, sensorConfig.title, sensorConfig.unit)
              }
              disabled={tableData.length === 0}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-colors"
              title="CSV 다운로드"
            >
              <Download size={20} className="text-slate-300" />
            </button>
          </div>
        </div>

        {/* 차트 섹션 */}
        <SensorChart
          data={chartData}
          sensorType={sensorType}
          sensorConfig={sensorConfig}
          startDate={startDate}
        />

        {/* 테이블 섹션 */}
        <SensorTable
          data={tableData}
          currentData={currentData}
          sortedData={sortedData}
          sensorType={sensorType}
          sensorConfig={sensorConfig}
          isAnyLoading={isAnyLoading}
          sortConfig={sortConfig}
          pagination={pagination}
          onSort={handleSort}
          onPaginationChange={setPagination}
        />
      </div>
    </div>
  )
}
