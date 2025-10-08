'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { ChartDataPoint, SensorConfig } from '@/types/sensor'
import { SENSOR_CONFIGS } from '@/constants/sensors'
import { Settings, ExternalLink } from 'lucide-react'

interface GrafanaStyleDashboardProps {
  dashboardData: ChartDataPoint[]
  isSidebarOpen?: boolean
}

// Utility: map value -> gauge arc (0..1)
const clamp = (v: number, a = 0, b = 1) => {
  if (isNaN(v) || !isFinite(v)) return 0
  return Math.max(a, Math.min(b, v))
}

// Small SVG radial gauge component
function RadialGauge({
  value,
  min = 0,
  max = 100,
  unit = '',
  label = '',
}: {
  value: number | null
  min?: number
  max?: number
  unit?: string
  label?: string
  color?: string
}) {
  if (value === null) {
    return (
      <div className="flex items-center gap-4">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <g transform="translate(60,60)">
            <circle r={48} fill="#0f172a" stroke="#0b1220" strokeWidth="10" />
            <circle
              r={48}
              fill="transparent"
              stroke="#172554"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={0}
              transform="rotate(-90)"
              opacity={0.3}
            />
            <text y="8" textAnchor="middle" fontSize="18" fill="#9fb0c8">
              --
            </text>
            <text y="30" textAnchor="middle" fontSize="12" fill="#9fb0c8">
              {unit}
            </text>
          </g>
        </svg>
        <div className="flex flex-col text-left">
          <div className="text-base text-slate-300 font-medium">{label}</div>
          <div className="text-sm text-slate-500">
            {min} — {max}
          </div>
        </div>
      </div>
    )
  }

  const ratio = clamp((value - min) / (max - min))
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - ratio)

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <linearGradient id={`gauge-${label}`} x1="0" x2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <g transform="translate(60,60)">
          <circle r={radius} fill="#0f172a" stroke="#0b1220" strokeWidth="10" />
          <circle
            r={radius}
            fill="transparent"
            stroke="#172554"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={0}
            transform="rotate(-90)"
            opacity={0.3}
          />
          <circle
            r={radius}
            fill="transparent"
            stroke={`url(#gauge-${label})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            transform="rotate(-90)"
            style={{ transition: 'stroke-dashoffset 200ms ease' }}
          />
          <text y="8" textAnchor="middle" fontSize="18" fill="#e6eef8">
            {isNaN(value) ? '--' : Math.round(value * 10) / 10}
          </text>
          <text y="30" textAnchor="middle" fontSize="12" fill="#9fb0c8">
            {unit}
          </text>
        </g>
      </svg>
      <div className="flex flex-col text-left">
        <div className="text-base text-slate-300 font-medium">{label}</div>
        <div className="text-sm text-slate-500">
          {min.toFixed(1)} — {max.toFixed(1)}
        </div>
      </div>
    </div>
  )
}

// Mini sparkline/area component for timeseries inside a panel
function MiniLine({
  data,
  dataKey = 'value',
  color = '#60a5fa',
  isSidebarOpen = false,
  uniqueId = 'default',
}: {
  data: { value: number; time: string }[]
  dataKey?: string
  color?: string
  isSidebarOpen?: boolean
  uniqueId?: string
}) {
  const width = isSidebarOpen ? 200 : 400 // 사이드바 상태에 따라 너비 조정

  return (
    <div style={{ width, height: 60 }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
        >
          <defs>
            <linearGradient
              id={`areaGrad-${uniqueId}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            strokeWidth={0}
            dot={false}
            stroke="transparent"
            fill={`url(#areaGrad-${uniqueId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Single metric panel component
function MetricPanel({
  title,
  value,
  unit,
  trendData,
  gaugeConfig,
  displayMinMax,
  color,
  dataKey,
  icon,
  iconAlt,
  isSidebarOpen = false,
}: {
  title: string
  value: number | null
  unit: string
  trendData: { value: number; time: string }[]
  gaugeConfig: { min: number; max: number }
  displayMinMax: { min: number; max: number }
  color: string
  dataKey: string
  icon: string
  iconAlt: string
  isSidebarOpen?: boolean
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 shadow-lg rounded-lg">
      <div className="flex items-start justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <Image
            src={icon}
            alt={iconAlt}
            width={20}
            height={20}
            className="object-contain"
          />
          <div>
            <div className="text-slate-100 text-base font-medium">{title}</div>
            <div className="text-slate-300 text-sm">실시간 데이터</div>
          </div>
        </div>
        <Link
          href={`/sensor/${dataKey}`}
          className="p-2 hover:bg-slate-800 rounded transition-colors"
          title={`${title} 상세보기`}
        >
          <ExternalLink
            size={16}
            className="text-slate-400 hover:text-slate-200"
          />
        </Link>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center gap-4">
          <RadialGauge
            value={value}
            unit={unit}
            label={title}
            min={gaugeConfig.min}
            max={gaugeConfig.max}
            color={color}
          />
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-400">추세 (최근 12시간)</div>
          <div className="text-sm text-slate-300">
            최대: {displayMinMax.max.toFixed(1)} · 최소:{' '}
            {displayMinMax.min.toFixed(1)}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <MiniLine
            data={trendData}
            dataKey="value"
            color={color}
            isSidebarOpen={isSidebarOpen}
            uniqueId={dataKey}
          />
          <div className="flex flex-col items-end">
            <div className="text-slate-100 text-xl font-semibold">
              {value !== null && !isNaN(value) ? `${value}${unit}` : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GrafanaStyleDashboard({
  dashboardData,
  isSidebarOpen = false,
}: GrafanaStyleDashboardProps) {
  // 히스토리 데이터에서 최근값을 실시간 데이터로 사용
  const realTimeData =
    dashboardData.length > 0
      ? dashboardData[dashboardData.length - 1]
      : { time: null }

  // 센서 설정에 값 추가
  const sensorConfigs: SensorConfig[] = SENSOR_CONFIGS.map((config) => {
    const rawValue = realTimeData[config.dataKey as keyof typeof realTimeData]
    const numericValue = typeof rawValue === 'number' ? rawValue : null
    return {
      ...config,
      value: numericValue ?? null,
    }
  })

  // 트렌드 데이터 생성 (최근 12시간)
  const generateTrendData = (dataKey: string) => {
    return dashboardData.slice(-24).map((point) => ({
      value: (point[dataKey as keyof typeof point] as number) || 0,
      time: point.time,
    }))
  }

  // 실제 데이터에서 최대/최소값 계산 (게이지용)
  const getDataMinMax = (dataKey: string) => {
    const values = dashboardData
      .map((point) => point[dataKey as keyof typeof point] as number)
      .filter((value) => value !== null && !isNaN(value))

    if (values.length === 0) {
      return { min: 0, max: 100 }
    }

    const dataMin = Math.min(...values)
    const dataMax = Math.max(...values)

    // 게이지가 너무 극단적이 되지 않도록 여유를 둠
    const range = dataMax - dataMin
    const padding = range * 0.1 // 10% 여유

    return {
      min: Math.max(0, dataMin - padding),
      max: dataMax + padding,
    }
  }

  // 표시용 최대/최소값 (실제 데이터 범위)
  const getDisplayMinMax = (dataKey: string) => {
    const values = dashboardData
      .map((point) => point[dataKey as keyof typeof point] as number)
      .filter((value) => value !== null && !isNaN(value))

    if (values.length === 0) {
      return { min: 0, max: 100 }
    }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }

  // 종합 타임라인 데이터
  const timelineData = dashboardData.slice(-24).map((point, index) => ({
    time: index,
    temperature: point.temperature || 0,
    humidity: point.humidity || 0,
    ec: point.ec || 0,
    ph: point.ph || 0,
    n: point.n || 0,
    p: point.p || 0,
    k: point.k || 0,
  }))

  return (
    <div className="min-h-screen p-6 text-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">
              SmartFarm · Monitoring
            </h1>
            <div className="text-sm md:text-base text-slate-400">
              실시간 센서 7지표
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="px-3 py-1 md:px-4 md:py-2 bg-slate-800 rounded text-sm md:text-base text-slate-300">
              <span className="hidden md:inline">업데이트: 1분</span>
              <span className="md:hidden">1m</span>
            </div>
            <Link
              href="/calibration"
              className="px-3 py-1 md:px-4 md:py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm md:text-base text-slate-300 flex items-center gap-1 md:gap-2 transition-colors"
            >
              <Settings size={14} className="md:w-4 md:h-4" />
              <span className="hidden md:inline">설정</span>
            </Link>
          </div>
        </header>

        <main>
          {/* 센서 카드들 */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-8 mb-8">
            {sensorConfigs.map((sensor, index) => {
              const gaugeMinMax = getDataMinMax(sensor.dataKey) // 게이지용 (여유 있음)
              const displayMinMax = getDisplayMinMax(sensor.dataKey) // 표시용 (실제 범위)
              return (
                <MetricPanel
                  key={index}
                  title={sensor.title}
                  value={sensor.value}
                  unit={sensor.unit}
                  trendData={generateTrendData(sensor.dataKey)}
                  gaugeConfig={gaugeMinMax}
                  displayMinMax={displayMinMax}
                  color={sensor.color}
                  dataKey={sensor.dataKey}
                  icon={sensor.icon}
                  iconAlt={sensor.iconAlt}
                  isSidebarOpen={isSidebarOpen}
                />
              )
            })}
          </section>

          {/* 종합 타임라인 */}
          <section className="mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-slate-100 text-xl font-medium">
                  종합 타임라인
                </h2>
                <div className="text-sm text-slate-400">
                  모든 센서 데이터의 12시간 추세
                </div>
              </div>
              <div className="p-6">
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <LineChart data={timelineData}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#f1f5f9',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f97316"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#60a5fa"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="ec"
                        stroke="#fbbf24"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="ph"
                        stroke="#10b981"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="n"
                        stroke="#ef4444"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="p"
                        stroke="#06b6d4"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="k"
                        stroke="#3b82f6"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* 하단 정보 */}
          <footer className="text-xs text-slate-500">
            구성: N,P,K,Temperature,pH,EC,Humidity · 실시간 업데이트 및 히스토리
            보기 가능
            <br />
            마지막 업데이트:{' '}
            {realTimeData.time
              ? new Date(realTimeData.time).toLocaleTimeString()
              : '--'}
          </footer>
        </main>
      </div>
    </div>
  )
}
