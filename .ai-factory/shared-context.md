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
  hooks/
    usePayslips.ts
    useRecords.ts
    useSettings.ts
  lib/
    storage.ts
    types.ts

### Exports (src/lib/)
- storage.ts: export function safeParse<T>( key: string, fallback: T, normalize?: (item: any) => any ): T; export function getRecords(): WorkRecord[]; export function setRecords(records: WorkRecord[]): void; export function getPayslips(): PayslipCheck[]; export function setPayslips(payslips: PayslipCheck[]): void; export function getSettings(): Settings; export function setSettings(settings: Partial<Settings>): void; export function getMeta(): Meta
- types.ts: export type PayType = "hourly" | "salary"; export type WorkRecord =; export type PayslipCheck =; export type Settings =

### Module Dependencies (import graph)
  lib/storage.ts → imports: lib/types
CRITICAL: Before creating any new function, type, or component, check the list above. If something similar exists, import and use it.