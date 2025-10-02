'use client'

import React from 'react'
import Image from 'next/image'
import { useCardHeight } from '@/hooks/useCardHeight'

interface CalibrationCardProps {
  title: string
  value: number | null
  unit: string
  icon: string
  iconAlt: string
  onSetClick: () => void
}

const CalibrationCard: React.FC<CalibrationCardProps> = React.memo(
  ({ title, value, unit, icon, iconAlt, onSetClick }) => {
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

        {/* 하단 버튼 */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <button
            onClick={onSetClick}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            설정
          </button>
        </div>

        {/* 하단 그라데이션 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-800 to-transparent z-10"></div>
      </div>
    )
  }
)

CalibrationCard.displayName = 'CalibrationCard'

export default CalibrationCard
