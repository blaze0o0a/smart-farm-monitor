// DB 연결 설정 (실제 DB 연결 시 주석 해제)
// import { Pool } from 'pg'

// PostgreSQL 연결 설정 (DB 연결 시 활성화)
// let pool: any = null

// if (process.env.DB_HOST) {
//   // 실제 DB 연결이 필요한 경우에만 동적 import
//   const { Pool } = require('pg')
//   pool = new Pool({
//     host: process.env.DB_HOST || 'localhost',
//     port: parseInt(process.env.DB_PORT || '5432'),
//     database: process.env.DB_NAME || 'smart_farm',
//     user: process.env.DB_USER || 'postgres',
//     password: process.env.DB_PASSWORD || 'password',
//     ssl:
//       process.env.NODE_ENV === 'production'
//         ? { rejectUnauthorized: false }
//         : false,
//     max: 20, // 최대 연결 수
//     idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
//     connectionTimeoutMillis: 2000, // 연결 타임아웃
//   })
// }

// // 연결 테스트
// export const testConnection = async () => {
//   if (!pool) {
//     console.log('⚠️ Database not configured (DB_HOST not set)')
//     return false
//   }
//   try {
//     const client = await pool.connect()
//     await client.query('SELECT NOW()')
//     client.release()
//     console.log('✅ Database connected successfully')
//     return true
//   } catch (error) {
//     console.error('❌ Database connection failed:', error)
//     return false
//   }
// }

// // 쿼리 실행 헬퍼
// export const query = async (text: string, params?: any[]) => {
//   if (!pool) {
//     throw new Error(
//       'Database not configured. Please set DB_HOST environment variable.'
//     )
//   }
//   const start = Date.now()
//   try {
//     const res = await pool.query(text, params)
//     const duration = Date.now() - start
//     console.log('Executed query', { text, duration, rows: res.rowCount })
//     return res
//   } catch (error) {
//     console.error('Query error:', { text, error })
//     throw error
//   }
// }

// // 트랜잭션 헬퍼
// export const transaction = async (callback: (client: any) => Promise<any>) => {
//   if (!pool) {
//     throw new Error(
//       'Database not configured. Please set DB_HOST environment variable.'
//     )
//   }
//   const client = await pool.connect()
//   try {
//     await client.query('BEGIN')
//     const result = await callback(client)
//     await client.query('COMMIT')
//     return result
//   } catch (error) {
//     await client.query('ROLLBACK')
//     throw error
//   } finally {
//     client.release()
//   }
// }

// export default pool
