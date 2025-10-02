'use client'

import React, { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import useAppStore from '@/stores/useAppStore'
import { TableDataRow } from '@/types/sensor'

export default function TablePage() {
  const { tableData, setTableData, isLoading, setLoading, setError } =
    useAppStore()
  const [startDate, setStartDate] = useState(new Date())
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // 테이블 데이터 가져오기
  const fetchTableData = useCallback(
    async (dateString: string) => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateString }),
        })

        if (!response.ok) {
          throw new Error('테이블 데이터를 불러오는데 실패했습니다.')
        }

        const data = await response.json()
        setTableData(data)
        setPagination((prev) => ({ ...prev, total: data.length }))
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
    const dateString = startDate.toISOString().split('T')[0]
    fetchTableData(dateString)
  }, [startDate, fetchTableData])

  const onDateChange = (date: moment.Moment | null) => {
    if (date) {
      setStartDate(date.toDate())
      setPagination((prev) => ({ ...prev, current: 1 }))
    }
  }

  const exportToCSV = () => {
    const headers = ['시간', '온도(°C)', '습도(%)', 'EC', 'pH', 'N', 'P', 'K']
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

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
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

  const startIndex = (pagination.current - 1) * pagination.pageSize
  const endIndex = startIndex + pagination.pageSize
  const currentData = tableData.slice(startIndex, endIndex)

  return (
    <div className="p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 text-center text-white">
          센서 데이터 테이블
        </h1>

        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={moment(startDate).format('YYYY-MM-DD')}
                onChange={(e) => onDateChange(moment(e.target.value))}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
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
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${column.width}`}
                    >
                      {column.label}
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
          {tableData.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-300">
                {startIndex + 1}-{Math.min(endIndex, tableData.length)} / 총{' '}
                {tableData.length}개
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current - 1,
                    }))
                  }
                  disabled={pagination.current === 1}
                  className="px-3 py-1 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-200 bg-gray-800"
                >
                  이전
                </button>
                <span className="px-3 py-1 text-sm text-gray-300">
                  {pagination.current} /{' '}
                  {Math.ceil(tableData.length / pagination.pageSize)}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current + 1,
                    }))
                  }
                  disabled={
                    pagination.current >=
                    Math.ceil(tableData.length / pagination.pageSize)
                  }
                  className="px-3 py-1 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-200 bg-gray-800"
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
