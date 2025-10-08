import React, { useState, useEffect } from 'react'
import moment from 'moment'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartDataPoint } from '@/types/sensor'
import { CHART_CONFIG } from '@/constants/app'

interface SensorChartProps {
  data: ChartDataPoint[]
  sensorType: string
  sensorConfig: {
    title: string
    color: string
  }
  startDate: Date
}

export function SensorChart({
  data,
  sensorType,
  sensorConfig,
  startDate,
}: SensorChartProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="mb-4 sm:mb-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
        <div className="p-3 sm:p-4 border-b border-slate-800">
          <h2 className="text-base sm:text-lg font-medium text-slate-100">
            {sensorConfig.title} 추세
          </h2>
          <div className="text-xs sm:text-sm text-slate-400">
            {moment(startDate).format('YYYY년 MM월 DD일')} 데이터
          </div>
        </div>
        <div className="p-1 sm:p-4">
          <div className="w-full h-[250px] sm:h-[400px]">
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 5,
                  left: isMobile ? 0 : 30,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(value) =>
                    moment(value).utcOffset(9).format('HH:mm')
                  }
                  fontSize={isMobile ? 10 : 12}
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#6B7280' }}
                />
                <YAxis
                  fontSize={isMobile ? 10 : 12}
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#6B7280' }}
                  width={isMobile ? 30 : 40}
                />
                <Tooltip
                  labelFormatter={(value) => {
                    const koreanTime = moment(value).utcOffset(9)
                    return koreanTime.format('YYYY-MM-DD HH:mm:ss')
                  }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={sensorType}
                  stroke={sensorConfig.color}
                  strokeWidth={CHART_CONFIG.STROKE_WIDTH}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
