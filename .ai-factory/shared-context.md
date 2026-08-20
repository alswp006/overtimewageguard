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
  components/
    BottomCTA.tsx
    Card.tsx
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
    types.ts
    validation.ts
  pages/
    HomePage.tsx
    RecordsPage.tsx
    ReportPage.tsx

### Exports (src/lib/)
- calc.ts: export type DayBreakdown =; export type MonthlySummary =; export function computeDay( record?: WorkRecord | null, settings?: Settings | null ): DayBreakdown | null; export function computeMonthlySummary( records?: WorkRecord[] | null, settings?: Settings | null ): MonthlySummary; export function findActiveRecord( records: WorkRecord[] | null | undefined, date: string ): WorkRecord | null; export function generateRecordId(date: string, records?: WorkRecord[] | null): string
- format.ts: export function formatWon(amount: number): string; export function formatHours(minutes: number): string
- storage.ts: export function safeParse<T>( key: string, fallback: T, normalize?: (item: any) => any ): T; export function getRecords(): WorkRecord[]; export function setRecords(records: WorkRecord[]): void; export function getPayslips(): PayslipCheck[]; export function setPayslips(payslips: PayslipCheck[]): void; export function getSettings(): Settings; export function setSettings(settings: Partial<Settings>): void; export function getMeta(): Meta
- types.ts: export type PayType = "hourly" | "salary"; export type WorkRecord =; export type PayslipCheck =; export type Settings =
- validation.ts: export type ValidationResult =; export function validateHourlyWage(value: number): ValidationResult; export function validateMonthlySalary(value: number): ValidationResult; export function validateMonthlyStandardHours(value: number): ValidationResult; export function validateBreakMinutes(value: number): ValidationResult; export function sanitizeMonthlyStandardHours(value: number): number

### Components (src/components/)
- BottomCTA.tsx: SubmitFooter
- Card.tsx: Card
- PageShell.tsx: PageShell
- ScreenScaffold.tsx: ScreenScaffold
- StateView.tsx: EmptyState

### Module Dependencies (import graph)
  lib/calc.ts → imports: lib/types, lib/validation
  lib/storage.ts → imports: lib/types
  pages/HomePage.tsx → imports: components/ScreenScaffold, components/Card, hooks/useRecords, hooks/useSettings, lib/calc, lib/format
  pages/RecordsPage.tsx → imports: components/ScreenScaffold, components/Card, components/BottomCTA, components/StateView, hooks/useRecords, lib/calc, lib/types
  pages/ReportPage.tsx → imports: components/ScreenScaffold, components/Card, components/StateView, hooks/useRecords, hooks/useSettings, lib/calc, lib/format
CRITICAL: Before creating any new function, type, or component, check the list above. If something similar exists, import and use it.

## Already Implemented (do NOT duplicate or overwrite)
- heal-1-02: 계산·리스트 로직의 빈/부분 데이터 방어 처리 (files: src/lib/calc.ts, src/lib/validation.ts, src/pages/RecordsPage.tsx, src/pages/ReportPage.tsx, src/pages/HomePage.tsx)