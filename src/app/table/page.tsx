'use client'

import React, { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import useAppStore from '@/stores/useAppStore'
import { TableDataRow } from '@/types/sensor'

export default function TablePage() {
  const { tableData, setTableData, isLoading, setLoading, setError } =
    useAppStore()
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12시간 전
  })
  const [endDate, setEndDate] = useState(new Date())
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // 테이블 데이터 가져오기
  const fetchTableData = useCallback(
    async (startDateString: string, endDateString: string) => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: startDateString,
            endDate: endDateString,
          }),
        })

        if (!response.ok) {
          throw new Error('테이블 데이터를 불러오는데 실패했습니다.')
        }

        const data = await response.json()
        setTableData(data)
        setPagination((prev) => ({
          ...prev,
          total: data.length,
          current: 1, // 데이터가 변경되면 첫 페이지로 리셋
        }))
      } catch (error) {
        console.error('테이블 데이터 가져오기 실패:', error)
        setError('테이블 데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, setTableData, setPagination]
  )

  useEffect(() => {
    const startDateString = startDate.toISOString()
    const endDateString = endDate.toISOString()
    fetchTableData(startDateString, endDateString)
  }, [startDate, endDate, fetchTableData])

  const onStartDateChange = (date: moment.Moment | null) => {
    if (date) {
      setStartDate(date.toDate())
      setPagination((prev) => ({ ...prev, current: 1 }))
    }
  }

  const onEndDateChange = (date: moment.Moment | null) => {
    if (date) {
      setEndDate(date.toDate())
      setPagination((prev) => ({ ...prev, current: 1 }))
    }
  }

  // 12시간 전부터 현재까지 설정
  const setLast12Hours = () => {
    const now = new Date()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)
    setStartDate(twelveHoursAgo)
    setEndDate(now)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  // 정렬 함수
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setPagination((prev) => ({ ...prev, current: 1 })) // 정렬 시 첫 페이지로
  }

  // 정렬된 데이터 생성
  const getSortedData = () => {
    if (!sortConfig) return tableData

    return [...tableData].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof typeof a]
      let bValue = b[sortConfig.key as keyof typeof b]

      // 시간 컬럼의 경우 특별 처리
      if (sortConfig.key === 'time') {
        // 시간 문자열을 Date 객체로 변환하여 비교
        const today = new Date().toDateString()
        aValue = new Date(`${today} ${aValue}`).getTime()
        bValue = new Date(`${today} ${bValue}`).getTime()
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const exportToCSV = () => {
    const headers = [
      'time',
      'temperature(°C)',
      'humidity(%)',
      'ec',
      'ph',
      'n',
      'p',
      'k',
    ]
    const csvContent = [
      headers.join(','),
      ...tableData.map((row: TableDataRow) =>
        [
          row.time,
          row.temperature,
          row.humidity,
          row.ec,
          row.ph,
          row.n,
          row.p,
          row.k,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `sensor_data_${moment(startDate).format('YYYY-MM-DD')}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns = [
    { key: 'time', label: '시간', width: 'w-24' },
    { key: 'temperature', label: '온도(°C)', width: 'w-20' },
    { key: 'humidity', label: '습도(%)', width: 'w-20' },
    { key: 'ec', label: 'EC', width: 'w-16' },
    { key: 'ph', label: 'pH', width: 'w-16' },
    { key: 'n', label: 'N', width: 'w-16' },
    { key: 'p', label: 'P', width: 'w-16' },
    { key: 'k', label: 'K', width: 'w-16' },
  ]

  const sortedData = getSortedData()
  const startIndex = (pagination.current - 1) * pagination.pageSize
  const endIndex = startIndex + pagination.pageSize
  const currentData = sortedData.slice(startIndex, endIndex)

  // 페이지네이션 정보 계산
  const totalPages = Math.ceil(sortedData.length / pagination.pageSize)
  const hasData = sortedData.length > 0

  return (
    <div className="p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 text-center text-white">
          센서 데이터 테이블
        </h1>

        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
              <span className="text-gray-300 font-medium">
                총 {tableData.length}개 데이터
              </span>
            </div>
            <button
              onClick={exportToCSV}
              disabled={tableData.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>CSV 다운로드</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-700">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${
                        column.width
                      } ${
                        column.key === 'time'
                          ? 'cursor-pointer hover:bg-gray-600'
                          : ''
                      }`}
                      onClick={
                        column.key === 'time'
                          ? () => handleSort(column.key)
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        <span>{column.label}</span>
                        {column.key === 'time' && (
                          <div className="flex items-center ml-1">
                            <svg
                              className={`w-3 h-3 ${
                                sortConfig?.key === column.key &&
                                sortConfig.direction === 'asc'
                                  ? 'text-blue-400'
                                  : 'text-gray-500'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                            <svg
                              className={`w-3 h-3 ml-0.5 ${
                                sortConfig?.key === column.key &&
                                sortConfig.direction === 'desc'
                                  ? 'text-blue-400'
                                  : 'text-gray-500'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-600">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-4 text-center"
                    >
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  currentData.map((row: TableDataRow, index: number) => (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {row.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {row.temperature?.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {row.humidity?.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {row.ec?.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {row.ph?.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {row.n?.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {row.p?.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {row.k?.toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {hasData && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-300">
                {startIndex + 1}-{Math.min(endIndex, sortedData.length)} / 총{' '}
                {sortedData.length}개 데이터
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current - 1,
                    }))
                  }
                  disabled={pagination.current === 1}
                  className="px-3 py-1 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-200 bg-gray-800 transition-colors"
                >
                  이전
                </button>
                <span className="px-3 py-1 text-sm text-gray-300 bg-gray-700 rounded">
                  {pagination.current} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current + 1,
                    }))
                  }
                  disabled={pagination.current >= totalPages}
                  className="px-3 py-1 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-200 bg-gray-800 transition-colors"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
