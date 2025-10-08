# 🌱 Smart Farm Monitoring System

스마트팜 센서 데이터 모니터링 및 캘리브레이션 시스템

## 📋 프로젝트 개요

실시간 센서 데이터 모니터링, 히스토리 차트, 데이터 테이블, 센서 캘리브레이션 기능을 제공하는 웹 애플리케이션입니다.

### 🎯 주요 기능

- **대시보드**: 7개 센서의 실시간 데이터 및 12시간 트렌드 차트 (Grafana 스타일)
- **센서 상세보기**: 개별 센서의 상세 차트 및 테이블 데이터
- **차트**: 선택한 날짜의 상세한 시계열 데이터 시각화
- **테이블**: 센서 데이터의 페이지네이션된 테이블 뷰 (정렬, CSV 다운로드)
- **캘리브레이션**: 센서 보정값 설정 (계수/오프셋) - 전문적인 UI

### 🔧 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Charts**: Recharts (반응형 차트)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date**: Moment.js
- **UI**: 다크 테마, 반응형 디자인

## 🚀 시작하기

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3331)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 샘플 데이터 생성 (선택사항)
npm run generate-data
```

브라우저에서 [http://localhost:3331](http://localhost:3331)을 열어 확인하세요.

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
│   ├── calibration/page.tsx   # 캘리브레이션 페이지
│   └── sensor/[sensorType]/page.tsx # 센서 상세 페이지
├── components/
│   ├── AppWrapper.tsx         # 앱 래퍼 (사이드바, 에러 처리)
│   ├── common/                # 공통 컴포넌트
│   │   ├── Sidebar.tsx        # 네비게이션 사이드바
│   │   ├── LoadingSpinner.tsx # 로딩 스피너
│   │   └── ErrorMessage.tsx   # 에러 메시지
│   ├── dashboard/
│   │   └── GrafanaStyleDashboard.tsx # Grafana 스타일 대시보드
│   ├── sensor/
│   │   ├── SensorChart.tsx    # 센서 차트 컴포넌트
│   │   └── SensorTable.tsx    # 센서 테이블 컴포넌트
│   └── calibration/
│       └── CalibrationCard.tsx # 캘리브레이션 카드
├── lib/
│   ├── db.ts                  # 데이터베이스 연결 설정
│   ├── dataGenerator.ts       # 샘플 데이터 생성
│   ├── dateUtils.ts           # 날짜 유틸리티
│   ├── fileDataManager.ts     # 파일 데이터 관리
│   └── sensorUtils.ts         # 센서 데이터 유틸리티
├── hooks/
│   └── useSensorData.ts       # 센서 데이터 커스텀 훅
├── types/
│   └── sensor.ts              # 센서 타입 정의
├── constants/
│   ├── app.ts                 # 앱 상수
│   └── sensors.ts             # 센서 설정 상수
└── stores/
    └── useAppStore.ts         # Zustand 상태 관리
```

## 🎨 UI/UX 특징

- **다크 테마**: 모든 페이지에 일관된 다크 테마 적용 (Slate 색상 팔레트)
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 대응
- **Grafana 스타일**: 전문적인 모니터링 대시보드 UI
- **실시간 업데이트**: 1분마다 자동 데이터 갱신
- **직관적 인터페이스**: 센서별 아이콘과 색상 구분
- **CSV 다운로드**: UTF-8 BOM 지원으로 한글 깨짐 방지
- **모바일 최적화**: 터치 친화적 인터페이스

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

### 🏗️ 아키텍처 개선

- ✅ **TypeScript 타입 안정성**: 완전한 타입 정의 및 검증
- ✅ **컴포넌트 최적화**: React.memo, useCallback, useMemo 적절히 활용
- ✅ **코드 중복 제거**: 커스텀 훅과 유틸리티 함수로 모듈화
- ✅ **일관된 에러 처리**: 전역 에러 상태 관리 및 사용자 친화적 메시지

### 🎨 UI/UX 개선

- ✅ **Grafana 스타일 대시보드**: 전문적인 모니터링 인터페이스
- ✅ **반응형 레이아웃**: 모바일부터 데스크톱까지 완벽 대응
- ✅ **다크 테마 일관성**: 모든 컴포넌트에 통일된 디자인
- ✅ **캘리브레이션 UI**: 전문적인 설정 인터페이스

### 🚀 성능 최적화

- ✅ **커스텀 훅 분리**: `useSensorData`로 로직과 UI 분리
- ✅ **메모이제이션**: 불필요한 리렌더링 방지
- ✅ **CSV 최적화**: UTF-8 BOM으로 한글 지원
- ✅ **빌드 최적화**: 프로덕션 빌드 성공 및 최적화

## 🚀 배포

### 정적 호스팅 (권장)

Vercel, Netlify 등 정적 호스팅 플랫폼에서 쉽게 배포 가능합니다.

```bash
# 빌드
npm run build

# 배포 (Vercel 예시)
npx vercel --prod
```

### Docker 배포

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3331
CMD ["npm", "start"]
```

## 📋 현재 상태

- ✅ **개발 완료**: 모든 기능 구현 및 테스트 완료
- ✅ **프로덕션 빌드**: 성공적으로 빌드됨
- ⏳ **데이터베이스 연결**: 목데이터 사용 중 (실제 DB 연결 대기)
- ✅ **UI/UX 완성**: 전문적인 모니터링 인터페이스

## 🔄 다음 단계

1. **데이터베이스 연결**: `src/lib/db.ts` 설정 및 API 수정
2. **실제 센서 데이터**: 하드웨어 센서와 연동
3. **알림 시스템**: 임계값 초과 시 알림 기능
4. **사용자 인증**: 로그인/권한 관리 시스템

---

**개발자**: 스마트팜 모니터링 시스템 개발팀  
**버전**: 2.0.0  
**라이선스**: MIT  
**최종 업데이트**: 2024년 12월
