# 🌱 Smart Farm Monitoring System

스마트팜 센서 데이터 모니터링 및 캘리브레이션 시스템

## 📋 프로젝트 개요

실시간 센서 데이터 모니터링, 히스토리 차트, 데이터 테이블, 센서 캘리브레이션 기능을 제공하는 웹 애플리케이션입니다.

### 🎯 주요 기능

- **대시보드**: 7개 센서의 실시간 데이터 및 12시간 트렌드 차트
- **차트**: 선택한 날짜의 상세한 시계열 데이터 시각화
- **테이블**: 센서 데이터의 페이지네이션된 테이블 뷰
- **캘리브레이션**: 센서 보정값 설정 (계수/오프셋)

### 🔧 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **State Management**: Zustand
- **Icons**: Next.js Image
- **Date**: Moment.js

## 🚀 시작하기

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📊 센서 데이터 구조

### 센서 종류

- **온도 (Temperature)**: °C
- **습도 (Humidity)**: %
- **EC (Electrical Conductivity)**: us/cm
- **pH**: 6-8 범위
- **NPK (질소/인/칼륨)**: ppm

### 데이터 포맷

```typescript
interface SensorData {
  time: string // ISO 8601 형식
  temperature: number // 온도 (°C)
  humidity: number // 습도 (%)
  ec: number // EC (us/cm)
  ph: number // pH
  n: number // 질소 (ppm)
  p: number // 인 (ppm)
  k: number // 칼륨 (ppm)
}
```

## 🗄️ 데이터베이스 연결 가이드

현재는 목데이터를 사용하고 있으며, 실제 데이터베이스 연결을 위해 다음 API들을 수정해야 합니다.

### 📁 API 구조 및 DB 연결 포인트

#### 1. `/api/dashboard` - 대시보드 데이터

**용도**: 12시간 히스토리 데이터 + 실시간 값

- **현재**: `generateDashboardData()` 함수 (목데이터)
- **DB 연결**: 12시간 전부터 현재까지 1시간 간격 데이터 조회
- **쿼리 예시**:

```sql
SELECT time, temperature, humidity, ec, ph, n, p, k
FROM sensor_data
WHERE time >= NOW() - INTERVAL 12 HOUR
ORDER BY time ASC
```

#### 2. `/api/chart` - 차트 데이터

**용도**: 특정 날짜의 상세한 시계열 데이터

- **현재**: `generateChartData(date, 60)` 함수 (목데이터)
- **DB 연결**: 선택한 날짜의 1분 간격 데이터 조회
- **쿼리 예시**:

```sql
SELECT time, temperature, humidity, ec, ph, n, p, k
FROM sensor_data
WHERE DATE(time) = ?
ORDER BY time ASC
```

#### 3. `/api/table` - 테이블 데이터

**용도**: 페이지네이션된 테이블 데이터

- **현재**: `generateTableData(date, 100)` 함수 (목데이터)
- **DB 연결**: 선택한 날짜의 데이터 + 페이지네이션
- **쿼리 예시**:

```sql
SELECT time, temperature, humidity, ec, ph, n, p, k
FROM sensor_data
WHERE DATE(time) = ?
ORDER BY time DESC
LIMIT ? OFFSET ?
```

#### 4. `/api/calibration` - 캘리브레이션 설정

**용도**: 센서 보정값 저장/조회

- **현재**: 메모리 저장 (`calibrationData[key] = value`)
- **DB 연결**: calibration 테이블에 저장/조회
- **테이블 구조**:

```sql
CREATE TABLE calibration (
  sensor_key VARCHAR(50) PRIMARY KEY,
  value DECIMAL(10,3) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🔄 DB 연결 작업 순서

1. **데이터베이스 설정**

   - DB 설치 및 설정
   - `smart_farm` 데이터베이스 생성
   - `sensor_data` 테이블 생성
   - `calibration` 테이블 생성

2. **환경 변수 설정**

   - `.env.local` 파일 생성
   - DB 연결 정보 추가:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=smart_farm
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

3. **의존성 설치**

   ```bash
   npm install pg @types/pg
   ```

4. **DB 연결 파일 확인**

   - `src/lib/db.ts` 파일이 이미 생성되어 있음(전체주석)
   - 연결 테스트: `testConnection()` 함수 사용

5. **API 수정**

   - 각 `route.ts`의 데이터 생성 함수를 DB 쿼리로 교체
   - `src/lib/db.ts`의 `query()` 함수 사용
   - 예시:

   ```typescript
   // src/app/api/dashboard/route.ts
   import { query } from '@/lib/db'

   export async function GET() {
     const result = await query(`
       SELECT time, temperature, humidity, ec, ph, n, p, k 
       FROM sensor_data 
       WHERE time >= NOW() - INTERVAL 12 HOUR
       ORDER BY time ASC
     `)
     return NextResponse.json(result.rows)
   }
   ```

6. **테스트**
   - 목데이터와 실제 데이터 비교 검증

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/                    # API 라우트
│   │   ├── dashboard/route.ts  # 12시간 히스토리 데이터
│   │   ├── chart/route.ts      # 차트용 상세 데이터
│   │   ├── table/route.ts      # 테이블용 데이터
│   │   └── calibration/route.ts # 캘리브레이션 설정
│   ├── page.tsx               # 대시보드 페이지
│   ├── chart/page.tsx         # 차트 페이지
│   ├── table/page.tsx         # 테이블 페이지
│   └── calibration/page.tsx   # 캘리브레이션 페이지
├── components/
│   ├── dashboard/GrafanaCard.tsx     # 대시보드 카드
│   └── calibration/CalibrationCard.tsx # 캘리브레이션 카드
├── lib/
│   └── db.ts                  # 데이터베이스 연결 설정
├── types/sensor.ts            # 타입 정의
├── constants/sensors.ts       # 센서 설정 상수
├── hooks/useCardHeight.ts     # 공통 훅
└── stores/useAppStore.ts      # 상태 관리
```

## 🎨 UI/UX 특징

- **다크 테마**: 모든 페이지에 일관된 다크 테마 적용
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 대응
- **실시간 업데이트**: 5분마다 자동 데이터 갱신
- **직관적 인터페이스**: 센서별 아이콘과 색상 구분

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start

# 린트 검사
npm run lint
```

## 📝 주요 개선사항

- ✅ TypeScript 타입 안정성
- ✅ 컴포넌트 최적화 (React.memo, useCallback)
- ✅ 코드 중복 제거 및 모듈화
- ✅ 일관된 에러 처리
- ✅ 반응형 레이아웃 최적화

## 🚀 배포

Vercel, Netlify 등 정적 호스팅 플랫폼에서 쉽게 배포 가능합니다.

---

**개발자**: 스마트팜 모니터링 시스템 개발팀  
**버전**: 1.0.0  
**라이선스**: MIT
