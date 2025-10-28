# 🌱 Smart Farm Monitoring System

스마트팜 센서 데이터 모니터링 및 캘리브레이션 시스템

## 📋 프로젝트 개요

**실시간 소켓 기반** 스마트팜 센서 데이터 모니터링, 히스토리 차트, 데이터 테이블, 센서 캘리브레이션 기능을 제공하는 웹 애플리케이션입니다.

## 🏗️ 시스템 아키텍처

### 실시간 소켓 기반 통신 구조

```
센서 데이터 → 데이터베이스 → Socket Server → WebSocket → 클라이언트
    (실시간)     (저장/조회)    (브로드캐스트)   (실시간 수신)   (차트 업데이트)
```

### 데이터 흐름

1. **센서 데이터 수집**: 실제 센서 또는 시뮬레이터에서 데이터 생성
2. **데이터 저장**: MariaDB 데이터베이스에 저장 (또는 메모리 버퍼)
3. **실시간 브로드캐스트**: Socket.IO를 통해 연결된 모든 클라이언트에게 전송
4. **클라이언트 업데이트**: React hooks를 통해 실시간 차트 및 테이블 업데이트

### 이중 모드 지원

- **🗄️ 데이터베이스 모드**: 실제 DB 연결 시 (프로덕션)
- **🔧 시뮬레이터 모드**: DB 미연결 시 (개발/데모)

### 🎯 주요 기능

- **대시보드**: 7개 센서의 실시간 데이터 및 12시간 트렌드 차트 (Grafana 스타일)
- **센서 상세보기**: 개별 센서의 상세 차트 및 테이블 데이터
- **차트**: 선택한 날짜의 상세한 시계열 데이터 시각화
- **테이블**: 센서 데이터의 페이지네이션된 테이블 뷰 (정렬, CSV 다운로드)
- **캘리브레이션**: 센서 보정값 설정 (계수/오프셋) - 전문적인 UI

### 🔧 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js Custom Server, Socket.IO
- **Database**: MariaDB (선택사항)
- **Real-time**: WebSocket 통신
- **Charts**: Recharts (반응형 차트)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date**: Moment.js
- **UI**: 다크 테마, 반응형 디자인

## 🔌 소켓 서버 연결 가이드

### 현재 구조

시스템은 **이중 모드**로 동작합니다:

#### 🔧 시뮬레이터 모드 (기본)

- DB 환경 변수가 설정되지 않은 경우
- 메모리 기반 데이터 버퍼 사용
- 1분마다 가상 센서 데이터 생성
- 개발 및 데모용

#### 🗄️ 데이터베이스 모드 (프로덕션)

- DB 환경 변수 설정 시 자동 전환
- MariaDB 데이터베이스 연결
- 실제 센서 데이터 저장/조회
- 프로덕션 환경용

## 🚀 퀵스타트 (3단계)

### 1️⃣ 프로젝트 설치

```bash
# 저장소 클론
git clone <repository-url>
cd nextjs-smart-farm

# 의존성 설치
npm install
```

### 2️⃣ 환경 설정 (선택사항)

```bash
# 환경 변수 템플릿 복사 (MariaDB 사용 시)
cp env.local.example .env.local

# 실제 센서 사용 시 센서 리더 복사
cp src/lib/sensorReader.js.example src/lib/sensorReader.js
```

### 3️⃣ 서버 실행

```bash
# 개발 서버 실행 (시뮬레이터 모드)
npm run dev

# 설정 확인 (선택사항)
npm run check
```

**🎉 완료!** [http://localhost:3331](http://localhost:3331)에서 애플리케이션을 확인하세요.

---

## 🔧 상세 설정 가이드

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
```

### 유용한 명령어

```bash
# 설정 상태 확인
npm run setup
npm run check

# 데이터베이스 연결 테스트만
npm run db:test

# 샘플 데이터 생성 (개발용)
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

### 소켓 기반 DB 연결

현재 시스템은 **Socket.IO 기반**으로 구현되어 있으며, DB 연결 시 자동으로 데이터베이스 모드로 전환됩니다.

### DB 연결 포인트

#### 1. 대시보드 데이터 (`socket: request:dashboard`)

**용도**: 12시간 히스토리 데이터 실시간 전송

- **현재**: 시뮬레이터 또는 DB 어댑터
- **DB 쿼리**:

```sql
SELECT time, temperature, humidity, ec, ph, n, p, k
FROM sensor_data
WHERE time >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
ORDER BY time ASC
```

#### 2. 차트 데이터 (`socket: request:chart`)

**용도**: 특정 날짜 범위의 상세 데이터

- **파라미터**: `{ startDate, endDate }`
- **DB 쿼리**:

```sql
SELECT time, temperature, humidity, ec, ph, n, p, k
FROM sensor_data
WHERE time >= ? AND time <= ?
ORDER BY time ASC
```

#### 3. 테이블 데이터 (`socket: request:table`)

**용도**: 페이지네이션된 테이블 데이터

- **파라미터**: `{ startDate, endDate }`
- **DB 쿼리**:

```sql
SELECT time, temperature, humidity, ec, ph, n, p, k
FROM sensor_data
WHERE time >= ? AND time <= ?
ORDER BY time DESC
```

#### 4. 캘리브레이션 (`socket: request:calibration`, `socket: update:calibration`)

**용도**: 센서 보정값 저장/조회

- **DB 테이블 구조**:

```sql
CREATE TABLE calibration (
  sensor_key VARCHAR(50) PRIMARY KEY,
  value DECIMAL(10,3) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 5. 센서 데이터 테이블

**메인 테이블 구조**:

```sql
CREATE TABLE sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  time DATETIME NOT NULL,
  temperature FLOAT(5,2),
  humidity FLOAT(5,2),
  ec FLOAT(5,2),
  ph FLOAT(4,2),
  n FLOAT(5,2),
  p FLOAT(5,2),
  k FLOAT(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sensor_data_time (time)
);
```

### 🔄 DB 연결 작업 순서

#### 1. 데이터베이스 설정

```bash
# MariaDB 설치 (Ubuntu/Debian)
sudo apt update
sudo apt install mariadb-server

# MariaDB 보안 설정
sudo mysql_secure_installation

# 데이터베이스 생성
sudo mysql -u root -p
CREATE DATABASE smart_farm;
CREATE USER 'smart_farm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON smart_farm.* TO 'smart_farm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2. 환경 변수 설정

`.env.local` 파일 생성:

```env
# 데이터베이스 연결 정보
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_farm
DB_USER=smart_farm_user
DB_PASSWORD=your_password

# 프로덕션에서는 SSL 사용
NODE_ENV=production
```

#### 3. 의존성 설치

```bash
# MariaDB 드라이버 설치
npm install mysql2

# TypeScript 타입은 mysql2에 포함됨
```

#### 4. 서버 시작

```bash
# 개발 모드 (DB 연결 시도)
npm run dev

# 시뮬레이터 모드 (DB 환경변수 없이)
unset DB_HOST && npm run dev
```

#### 5. 스키마 자동 생성

서버 시작 시 자동으로 테이블이 생성됩니다:

```
🗄️ 데이터베이스 모드로 실행
✅ MariaDB 데이터베이스 연결 성공
✅ MariaDB 데이터베이스 스키마 생성 완료
```

## 👨‍💻 개발자 가이드

### 소켓 이벤트 구조

#### 클라이언트 → 서버 (요청)

```typescript
// 대시보드 데이터 요청
socket.emit('request:dashboard')

// 차트 데이터 요청
socket.emit('request:chart', { startDate: '2024-01-01', endDate: '2024-01-02' })

// 테이블 데이터 요청
socket.emit('request:table', { startDate: '2024-01-01', endDate: '2024-01-02' })

// 캘리브레이션 데이터 요청
socket.emit('request:calibration')

// 캘리브레이션 업데이트
socket.emit('update:calibration', { key: 'temperature', value: 1.5 })
```

#### 서버 → 클라이언트 (응답)

```typescript
// 데이터 수신
socket.on('data:dashboard', (data) => console.log('대시보드 데이터:', data))
socket.on('data:chart', (data) => console.log('차트 데이터:', data))
socket.on('data:table', (data) => console.log('테이블 데이터:', data))
socket.on('data:calibration', (data) => console.log('캘리브레이션:', data))

// 실시간 데이터 (자동 브로드캐스트)
socket.on('data:realtime', (data) => console.log('실시간 센서 데이터:', data))

// 에러 처리
socket.on('error', (message) => console.error('에러:', message))
```

### 실제 센서 연결 방법

#### 1. 센서 데이터 수집 로직 작성

```javascript
// src/lib/sensorReader.js
class RealSensorReader {
  constructor(serialPort) {
    this.port = serialPort
    this.onDataCallback = null
  }

  start() {
    // 시리얼 포트 또는 HTTP API로 센서 데이터 수집
    setInterval(() => {
      const sensorData = this.readFromSensor()
      if (this.onDataCallback) {
        this.onDataCallback(sensorData)
      }
    }, 60000) // 1분마다
  }

  onData(callback) {
    this.onDataCallback = callback
  }

  readFromSensor() {
    // 실제 센서에서 데이터 읽기
    return {
      time: new Date().toISOString(),
      temperature: /* 센서값 */,
      humidity: /* 센서값 */,
      // ... 기타 센서값
    }
  }
}
```

#### 2. 소켓 서버에 연결

```javascript
// src/lib/socketServer.js 수정
const { RealSensorReader } = require('./sensorReader')

// 시뮬레이터 대신 실제 센서 사용
if (process.env.USE_REAL_SENSOR === 'true') {
  const sensorReader = new RealSensorReader('/dev/ttyUSB0')
  sensorReader.onData(async (newData) => {
    // DB에 저장
    if (isUsingDatabase) {
      await dbAdapter.insertSensorData(newData)
    }
    // 실시간 브로드캐스트
    io.emit('data:realtime', newData)
  })
  sensorReader.start()
}
```

### 커스터마이징 가이드

#### 새로운 센서 추가

1. **타입 정의 수정** (`src/types/sensor.ts`)
2. **DB 스키마 수정** (새 컬럼 추가)
3. **소켓 이벤트 처리** 추가
4. **클라이언트 UI** 업데이트

#### 데이터 처리 주기 변경

```javascript
// src/lib/socketServer.js
setInterval(() => {
  // 데이터 생성 주기 변경
}, 30000) // 30초마다
```

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx               # 대시보드 페이지 (소켓 기반)
│   ├── chart/page.tsx         # 차트 페이지 (소켓 기반)
│   ├── table/page.tsx         # 테이블 페이지 (소켓 기반)
│   ├── calibration/page.tsx   # 캘리브레이션 페이지 (소켓 기반)
│   └── sensor/[sensorType]/page.tsx # 센서 상세 페이지 (소켓 기반)
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
│   ├── socketServer.js        # Socket.IO 서버 (메인)
│   ├── dbSocketAdapter.js     # DB-소켓 어댑터
│   ├── db.ts                  # 데이터베이스 연결 설정 (참고용)
│   ├── dateUtils.ts           # 날짜 유틸리티
│   └── sensorDataUtils.ts     # 센서 데이터 유틸리티
├── hooks/
│   ├── useSocket.ts           # 소켓 연결 관리 훅
│   ├── useSocketData.ts       # 소켓 데이터 훅들
│   └── useSensorData.ts       # 센서 데이터 커스텀 훅 (소켓 기반)
├── types/
│   ├── sensor.ts              # 센서 타입 정의
│   └── socket.ts              # 소켓 이벤트 타입 정의
├── constants/
│   ├── app.ts                 # 앱 상수
│   └── sensors.ts             # 센서 설정 상수
└── stores/
    └── useAppStore.ts         # Zustand 상태 관리

# 루트 파일
server.js                      # Custom Next.js + Socket.IO 서버
package.json                   # 의존성 (socket.io 포함)
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

- ✅ **소켓 시스템 완성**: 실시간 WebSocket 통신 구현
- ✅ **이중 모드 지원**: DB 연결 시 자동 전환, 미연결 시 시뮬레이터
- ✅ **프로덕션 빌드**: 성공적으로 빌드됨
- ✅ **DB 어댑터 준비**: MariaDB 연결 준비 완료
- ✅ **UI/UX 완성**: 전문적인 모니터링 인터페이스
- ✅ **개발자 가이드**: 완전한 온보딩 문서

## 🔄 다음 단계 (다른 개발자용)

### 즉시 사용 가능

```bash
# 시뮬레이터 모드로 바로 실행
npm run dev
```

### DB 연결 시

1. **환경 변수 설정**: `.env.local`에 DB 정보 추가
2. **MariaDB 설치**: 로컬 또는 클라우드 DB 준비
3. **서버 재시작**: 자동으로 DB 모드로 전환

### 실제 센서 연결 시

1. **센서 리더 구현**: `src/lib/sensorReader.js` 작성
2. **환경 변수 추가**: `USE_REAL_SENSOR=true`
3. **데이터 수집 로직**: 시리얼 포트 또는 HTTP API 연동

### 추가 기능 개발

1. **알림 시스템**: 임계값 초과 시 알림 기능
2. **사용자 인증**: 로그인/권한 관리 시스템
3. **데이터 분석**: 머신러닝 기반 예측 기능

---

**개발자**: 스마트팜 모니터링 시스템 개발팀  
**버전**: 2.0.0  
**라이선스**: MIT  
**최종 업데이트**: 2024년 12월
