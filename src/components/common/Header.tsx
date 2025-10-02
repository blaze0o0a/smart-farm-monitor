'use client'

import React, { useState } from 'react'
import useAppStore from '@/stores/useAppStore'
import Link from 'next/link'
import Image from 'next/image'

const Header: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    {
      key: 'dashboard',
      label: '대시보드',
      href: '/',
    },
    {
      key: 'chart',
      label: '차트',
      href: '/chart',
    },
    {
      key: 'table',
      label: '데이터 테이블',
      href: '/table',
    },
    {
      key: 'calibration',
      label: '캘리브레이션',
      href: '/calibration',
    },
  ]

  const handleMenuClick = (key: string) => {
    setActiveTab(key)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <div className="flex items-center">
              <Image
                src="/icons/dashboard_icon.png"
                alt="Smart Farm"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="ml-3 text-xl font-bold text-white">
                Smart Farm
              </span>
            </div>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center space-x-2">
              {menuItems.map((item) => (
                <Link key={item.key} href={item.href}>
                  <button
                    onClick={() => handleMenuClick(item.key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === item.key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                </Link>
              ))}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-gray-800 shadow-xl border-l border-gray-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-white">메뉴</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link key={item.key} href={item.href}>
                    <button
                      onClick={() => handleMenuClick(item.key)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === item.key
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
