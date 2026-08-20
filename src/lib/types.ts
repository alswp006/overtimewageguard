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
