# 패킷 가이드: 저장소 계층에 스키마 정규화 + 안전 파싱 도입

## 개요
이 패킷은 localStorage 접근을 안전하게 추상화하는 저장소 계층을 만드는 작업입니다.
**테스트-첫** 접근으로 작성되었으므로, 테스트를 먼저 읽고 구현하세요.

## 테스트 파일
- `src/__tests__/packet-heal-1-01.test.ts` — 15개 테스트 (전부 통과)

## 구현해야 할 파일

### 1. `src/lib/storage.ts` (필수)
#### 핵심 함수

```typescript
// 제네릭 안전 파싱 유틸리티
export function safeParse<T>(
  key: string,
  fallback: T,
  normalize?: (item: any) => any
): T

// 근무 기록 조회 (항상 배열, never undefined)
export function getRecords(): WorkRecord[]

// 급여명세 조회 (항상 배열, never undefined)
export function getPayslips(): PayslipCheck[]

// 설정 조회 (항상 기본값 병합 객체, never undefined)
export function getSettings(): {
  payType: 'hourly' | 'salary'
  hourlyWage: number
  monthlySalary: number
  monthlyStandardHours: number
  defaultBreakMinutes: number
  isSmallBusiness: boolean
}

// 저장 함수들
export function setRecords(records: WorkRecord[]): void
export function setPayslips(payslips: PayslipCheck[]): void
export function setSettings(settings: Partial<ReturnType<typeof getSettings>>): void
```

#### 구현 요구사항

1. **getRecords()**
   - Storage key: `owg.records.v1`
   - localStorage가 비어 있거나 손상된 경우: `[]` 반환
   - 각 아이템에 필수 필드 누락 시 기본값으로 채우기:
     - `id`: UUID 또는 timestamp 기반 고유 ID
     - `date`: ISO 날짜 문자열 (예: "2026-08-21")
     - `breakMinutes`: 기본값 0
   - 절대 `undefined` 반환 금지

2. **getPayslips()**
   - Storage key: `owg.payslips.v1`
   - localStorage가 비어 있거나 손상된 경우: `[]` 반환
   - 각 아이템에 필수 필드 누락 시:
     - `id`: 고유 ID
     - `date`: ISO 날짜
     - `grossAmount`, `deductions`, `netAmount`: 기본값 0
   - 절대 `undefined` 반환 금지

3. **getSettings()**
   - Storage key: `owg.settings.v1`
   - 기본값:
     ```javascript
     {
       payType: 'hourly',
       hourlyWage: 0,
       monthlySalary: 0,
       monthlyStandardHours: 209,
       defaultBreakMinutes: 60,
       isSmallBusiness: false
     }
     ```
   - localStorage 손상 또는 미존재: 기본값 그대로 반환
   - localStorage 값이 부분적(일부 필드만): 기본값과 병합 (저장된 값 우선)
   - 절대 `undefined` 반환 금지

4. **setRecords() / setPayslips() / setSettings()**
   - 주어진 값을 JSON.stringify로 저장
   - 에러 처리 필요 (선택사항이지만 권장)

5. **safeParse<T>()**
   - 범용 파싱 유틸리티
   - 동작:
     1. localStorage에서 `key` 값을 읽음
     2. JSON.parse 시도
     3. 실패하거나 null이면 `fallback` 반환
     4. `normalize` 함수 제공 시, 배열 각 항목에 적용
   - 서명: `safeParse<T>(key: string, fallback: T, normalize?: (item: any) => any): T`

## 테스트 커버리지

### AC-1: Empty localStorage 안전성
- ✅ getRecords() returns [] when empty
- ✅ getSettings() returns defaults when empty
- ✅ getPayslips() returns [] when empty

### AC-2: 손상된 데이터 복구력
- ✅ Invalid JSON (`"{"`) → fallback 반환
- ✅ null 문자열 → fallback 반환
- ✅ 타입 불일치 (숫자가 배열 자리) → fallback 반환

### AC-3: 스키마 정규화
- ✅ 배열 아이템 필드 누락 시 기본값 채우기
- ✅ 설정 부분 병합 (spread merge)
- ✅ 타입 안전성 (undefined 없음)

## 다음 단계

1. **구현 전**
   ```bash
   npx vitest run src/__tests__/packet-heal-1-01.test.ts
   ```
   모든 테스트가 현재 통과합니다 (inline 구현 때문).

2. **src/lib/storage.ts 구현**
   - 실제 함수들을 만들고 export
   - 테스트 파일의 inline 함수들을 import로 교체

3. **테스트 업데이트**
   - 테스트 파일에서 inline 함수 제거
   - `import { getRecords, getSettings, ... } from "@/lib/storage"` 추가

4. **TypeScript 검증**
   ```bash
   npx tsc --noEmit
   ```
   모든 반환 타입에 `undefined` 없어야 함.

5. **프로덕션 빌드**
   ```bash
   npx vite build
   ```
   미해결 import 0건 확인.

## 주의사항

- **플랫폼 의존성 제거 금지**: package.json의 TDS/토스 SDK 패키지 건드리지 말 것
- **저장소 키 일관성**: `owg.records.v1`, `owg.payslips.v1`, `owg.settings.v1` 정확히 유지
- **타입 정의**: WorkRecord, PayslipCheck는 src/lib/types.ts 참조
- **try/catch 필수**: JSON.parse는 항상 try/catch로 감싸기
