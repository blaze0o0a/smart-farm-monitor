import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AppWrapper from '@/components/AppWrapper'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Farm Monitor',
  description: '스마트팜 실시간 모니터링 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  )
}
