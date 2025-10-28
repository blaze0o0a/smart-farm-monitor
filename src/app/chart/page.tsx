/**
 * @fileoverview 차트 페이지 컴포넌트
 * @description 센서 데이터의 시간대별 상세 차트를 표시하는 페이지
 * @module app/chart/page
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import moment from 'moment'
import useAppStore from '@/stores/useAppStore'
import { useChartData } from '@/hooks/useSocketData'

/**
 * 차트 페이지 컴포넌트
 * @description 선택한 날짜 범위의 센서 데이터를 시간대별 차트로 시각화
 * @returns {JSX.Element} 차트 시각화 UI
 */
export default function ChartPage() {
  const { chartData, setChartData, setLoading, setError } = useAppStore()
  const [activeTab, setActiveTab] = useState('Temperature & Humidity')
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12시간 전
  })
  const [endDate, setEndDate] = useState(new Date())

  // 소켓 기반 차트 데이터
  const {
    data: socketChartData,
    loading: socketLoading,
    error: socketError,
  } = useChartData(startDate.toISOString(), endDate.toISOString())

  // 소켓 데이터를 스토어에 동기화
  useEffect(() => {
    if (socketChartData) {
      setChartData(socketChartData)
    }
  }, [socketChartData, setChartData])

  useEffect(() => {
    if (socketError) {
      setError(socketError)
    }
  }, [socketError, setError])

  useEffect(() => {
    setLoading(socketLoading)
  }, [socketLoading, setLoading])

  // 날짜 변경 시 자동으로 소켓 데이터가 업데이트됨

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  const onStartDateChange = (date: moment.Moment | null) => {
    if (date) {
      setStartDate(date.toDate())
    }
  }

  const onEndDateChange = (date: moment.Moment | null) => {
    if (date) {
      setEndDate(date.toDate())
    }
  }

  // 12시간 전부터 현재까지 설정
  const setLast12Hours = () => {
    const now = new Date()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)
    setStartDate(twelveHoursAgo)
    setEndDate(now)
  }

  const renderChart = (dataKeys: string[], colors: string[]) => {
    return (
      <div className="w-full" style={{ height: 'calc(60vh)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              tickFormatter={(value) => moment(value).format('HH:mm')}
              fontSize={12}
              className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl"
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#6B7280' }}
            />
            <YAxis
              fontSize={12}
              className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl"
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#6B7280' }}
            />
            <Tooltip
              labelFormatter={(value) =>
                moment(value).format('YYYY-MM-DD HH:mm:ss')
              }
              contentStyle={{
                backgroundColor: '#374151',
                border: '1px solid #6B7280',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index]}
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const chartConfigs = [
    {
      key: 'Temperature & Humidity',
      label: '온도 & 습도',
      dataKeys: ['temperature', 'humidity'],
      colors: ['#ff7300', '#0088fe'],
    },
    {
      key: 'pH & EC',
      label: 'pH & EC',
      dataKeys: ['ph', 'ec'],
      colors: ['#00c49f', '#ffbb28'],
    },
    {
      key: 'NPK',
      label: 'NPK',
      dataKeys: ['n', 'p', 'k'],
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
    },
  ]

  return (
    <div className="p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 text-center text-white">
          센서 데이터 차트
        </h1>

        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">시작:</label>
              <input
                type="datetime-local"
                value={moment(startDate).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => onStartDateChange(moment(e.target.value))}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">종료:</label>
              <input
                type="datetime-local"
                value={moment(endDate).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => onEndDateChange(moment(e.target.value))}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
            <button
              onClick={setLast12Hours}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              최근 12시간
            </button>
          </div>

          <div className="w-full">
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {chartConfigs.map((config) => (
                  <button
                    key={config.key}
                    onClick={() => handleTabChange(config.key)}
                    className={`py-2 px-1 sm:py-3 sm:px-2 md:py-4 md:px-2 border-b-2 font-medium text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl ${
                      activeTab === config.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              {chartConfigs.map((config) => (
                <div
                  key={config.key}
                  className={activeTab === config.key ? 'block' : 'hidden'}
                >
                  {renderChart(config.dataKeys, config.colors)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
