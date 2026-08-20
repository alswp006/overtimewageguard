# Shared Context (auto-generated — do NOT modify)


## Shared Types Contract (IMPORT these, do NOT redefine)
```typescript
// 모든 도메인 타입 정의 — 다른 파일에서 재정의 금지

export type PayType = "hourly" | "salary";

export type WorkRecord = {
  id: string;
  date: string; // YYYY-MM-DD
  startAt: string; // HH:MM
  endAt: string; // HH:MM
  breakMinutes: number;
  memo?: string;
};

export type PayslipCheck = {
  id: string;
  date: string; // YYYY-MM-DD
  grossAmount: number;
  deductions: number;
  netAmount: number;
  memo?: string;
};

export type Settings = {
  payType: PayType;
  hourlyWage: number;
  monthlySalary: number;
  monthlyStandardHours: number;
  defaultBreakMinutes: number;
  isSmallBusiness: boolean;
};

```

## Existing Codebase (import and use these — do NOT recreate)
### File Tree (src/)
  App.tsx
  components/
    AppErrorBoundary.tsx
    BottomCTA.tsx
    Card.tsx
    EmptyState.tsx
    PageShell.tsx
    ScreenScaffold.tsx
    StateView.tsx
  hooks/
    usePayslips.ts
    useRecords.ts
    useSettings.ts
  lib/
    calc.ts
    format.ts
    storage.ts
    theme.ts
    types.ts
    validation.ts
  main.tsx
  pages/
    HomePage.tsx
    RecordsPage.tsx
    ReportPage.tsx
  router.tsx

### Exports (src/lib/)
- calc.ts: export type DayBreakdown =; export type MonthlySummary =; export function computeDay( record?: WorkRecord | null, settings?: Settings | null ): DayBreakdown | null; export function computeMonthlySummary( records?: WorkRecord[] | null, settings?: Settings | null ): MonthlySummary; export function findActiveRecord( records: WorkRecord[] | null | undefined, date: string ): WorkRecord | null; export function generateRecordId(date: string, records?: WorkRecord[] | null): string
- format.ts: export function formatWon(amount: number): string; export function formatHours(minutes: number): string
- storage.ts: export function safeParse<T>( key: string, fallback: T, normalize?: (item: any) => any ): T; export function getRecords(): WorkRecord[]; export function setRecords(records: WorkRecord[]): void; export function getPayslips(): PayslipCheck[]; export function setPayslips(payslips: PayslipCheck[]): void; export function getSettings(): Settings; export function setSettings(settings: Partial<Settings>): void; export function getMeta(): Meta
- theme.ts: export const tdsColor =
- types.ts: export type PayType = "hourly" | "salary"; export type WorkRecord =; export type PayslipCheck =; export type Settings =
- validation.ts: export type ValidationResult =; export function validateHourlyWage(value: number): ValidationResult; export function validateMonthlySalary(value: number): ValidationResult; export function validateMonthlyStandardHours(value: number): ValidationResult; export function validateBreakMinutes(value: number): ValidationResult; export function sanitizeMonthlyStandardHours(value: number): number

### Components (src/components/)
- BottomCTA.tsx: SubmitFooter
- Card.tsx: Card
- EmptyState.tsx: EmptyState
- PageShell.tsx: PageShell
- ScreenScaffold.tsx: ScreenScaffold

### Module Dependencies (import graph)
  lib/calc.ts → imports: lib/types, lib/validation
  lib/storage.ts → imports: lib/types
  pages/HomePage.tsx → imports: components/ScreenScaffold, components/Card, hooks/useRecords, hooks/useSettings, lib/calc, lib/format, lib/theme
  pages/RecordsPage.tsx → imports: components/ScreenScaffold, components/Card, components/BottomCTA, components/EmptyState, hooks/useRecords, lib/calc, lib/types, lib/theme
  pages/ReportPage.tsx → imports: components/ScreenScaffold, components/Card, components/EmptyState, hooks/useRecords, hooks/useSettings, lib/calc, lib/format, lib/theme
CRITICAL: Before creating any new function, type, or component, check the list above. If something similar exists, import and use it.

## Already Implemented (do NOT duplicate or overwrite)
- heal-1-02: 계산·리스트 로직의 빈/부분 데이터 방어 처리 (files: src/lib/calc.ts, src/lib/validation.ts, src/pages/RecordsPage.tsx, src/pages/ReportPage.tsx, src/pages/HomePage.tsx)
- heal-1-03: 라우트 단위 ErrorBoundary + 빈 상태 컴포넌트 (files: src/components/AppErrorBoundary.tsx, src/components/EmptyState.tsx, src/App.tsx, src/router.tsx)

## Available exports from existing files
// src/App.tsx
export default function App() {

// src/components/AppErrorBoundary.tsx
export default class AppErrorBoundary extends Component<

// src/components/BottomCTA.tsx
export function SubmitFooter({ children, onClick, disabled }: SubmitFooterProps) {

// src/components/Card.tsx
export default function Card({ children, testId }: CardProps) {

// src/components/EmptyState.tsx
export function EmptyState({ title, description, action, testId }: EmptyStateProps) {
export default EmptyState;

// src/components/PageShell.tsx
export default function PageShell({ children }: PageShellProps) {

// src/components/ScreenScaffold.tsx
export default function ScreenScaffold({ top, bottom, children }: ScreenScaffoldProps) {

// src/components/StateView.tsx
export { EmptyState, default } from "@/components/EmptyState";

// src/lib/calc.ts
export type DayBreakdown = {
export type MonthlySummary = {
export function computeDay(
export function computeMonthlySummary(
export function findActiveRecord(
export function generateRecordId(date: string, records?: WorkRecord[] | null): string {

// src/lib/format.ts
export function formatWon(amount: number): string {
export function formatHours(minutes: number): string {

// src/lib/theme.ts
export const tdsColor = {

// src/lib/types.ts
export type PayType = "hourly" | "salary";
export type WorkRecord = {
export type PayslipCheck = {
export type Settings = {

// src/lib/validation.ts
export type ValidationResult = { valid: boolean; message?: string };
export function validateHourlyWage(value: number): ValidationResult {
export function validateMonthlySalary(value: number): ValidationResult {
export function validateMonthlyStandardHours(value: number): ValidationResult {
export function validateBreakMinutes(value: number): ValidationResult {
export function sanitizeMonthlyStandardHours(value: number): number {

// src/router.tsx
export type AppRoute = {
export const appRoutes: AppRoute[] = [

## Memory Index (자동 학습 — 힌트로만 사용, 실제 코드 확인 필수)

Available topics: deploy(1), general(6), testing(2), ui(4)

Key lessons (verify against actual code before applying):
- [deploy] 빌드 불안정 — 의존성 버전 고정, 빌드 전 typecheck 필수 (60% · 타 앱 1회 — 맹신 금지)
- [testing] 여러 화면이 공유하는 상태 훅·데이터 계층은 반환 시그니처와 실패 사유 코드를 먼저 테스트로 고정하고 통과시킨 뒤에야 의존 화면 작업을 시작하고, 화면은 예외 대신 결과 객체로 분기하게 하라. (60% · 타 앱 1회 — 맹신 금지)
- [general] 정책·기능 제거형 리팩터링은 화면과 도메인 로직 레이어에서만 수행하고, package.json의 플랫폼 필수 의존성(디자인 시스템·플랫폼 SDK·프레임워크 코어)은 어떤 경우에도 삭제하지 말 것 — 필수 패키지 화이트리스트를 빌드 전 가드로 검증하라. (60% · 타 앱 1회 — 맹신 금지)
- [general] 공용 기반 모듈(상수·저장소·계산 유틸)이 실제로 머지되기 전에는 이를 import하는 화면·훅 패킷을 머지하지 말고, 모든 머지 게이트에 타입체크와 프로덕션 빌드 통과(미해결 import 0건)를 필수로 걸어라. (60% · 타 앱 1회 — 맹신 금지)
- [ui] 온보딩/인증 가드는 현재 경로가 목적지 경로와 같으면 리다이렉트를 건너뛰고, 상태 로딩 중에는 리다이렉트를 보류하라 — 그렇지 않으면 무한 루프나 초기 크래시로 전 라우트가 타임아웃된다. (60% · 타 앱 1회 — 맹신 금지)