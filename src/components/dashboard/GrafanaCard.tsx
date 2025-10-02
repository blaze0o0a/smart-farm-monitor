'use client'

import React from 'react'
import Image from 'next/image'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { ChartDataPoint } from '@/types/sensor'
import { useCardHeight } from '@/hooks/useCardHeight'

interface GrafanaCardProps {
  title: string
  value: number | null
  unit: string
  icon: string
  iconAlt: string
  chartData: ChartDataPoint[]
  dataKey: string
  color: string
}

const GrafanaCard: React.FC<GrafanaCardProps> = React.memo(
  ({ title, value, unit, icon, iconAlt, chartData, dataKey, color }) => {
    const cardHeight = useCardHeight()

    return (
      <div
        className="bg-gray-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 relative overflow-hidden h-52 sm:h-56 md:h-60 p-3"
        style={{
          height: cardHeight || undefined,
        }}
      >
        {/* 상단 제목 */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center space-x-2">
            <Image
              src={icon}
              alt={iconAlt}
              width={16}
              height={16}
              className="object-contain"
            />
            <span className="text-lg font-medium text-gray-300">{title}</span>
          </div>
        </div>

        {/* 중앙 값 */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-1">
              {value !== null ? `${value}` : '--'}
            </div>
            {unit && (
              <div className="text-sm text-gray-300 font-medium">{unit}</div>
            )}
          </div>
        </div>

        {/* 배경 그래프 */}
        <div className="absolute inset-0 opacity-20 z-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id={`gradient-${dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={false}
                domain={['dataMin', 'dataMax']}
                width={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={false}
                domain={['dataMin - 2', 'dataMax + 2']}
                width={0}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${dataKey})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 하단 그라데이션 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-800 to-transparent z-10"></div>
      </div>
    )
  }
)

GrafanaCard.displayName = 'GrafanaCard'

export default GrafanaCard
