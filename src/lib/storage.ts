import type { WorkRecord, PayslipCheck, Settings } from "@/lib/types";

const RECORDS_KEY = "owg.records.v1";
const PAYSLIPS_KEY = "owg.payslips.v1";
const SETTINGS_KEY = "owg.settings.v1";
const META_KEY = "owg.meta.v1";

const DEFAULT_SETTINGS: Settings = {
  payType: "hourly",
  hourlyWage: 0,
  monthlySalary: 0,
  monthlyStandardHours: 209,
  defaultBreakMinutes: 60,
  isSmallBusiness: false,
};

type Meta = Record<string, unknown>;
const DEFAULT_META: Meta = {};

/**
 * 제네릭 안전 파싱 유틸리티.
 * fallback이 배열이면 타입 불일치 시 fallback을 반환하고, normalize가 있으면 각 항목에 적용한다.
 * fallback이 객체(배열 아님)면 저장된 값과 spread 병합한다.
 */
export function safeParse<T>(
  key: string,
  fallback: T,
  normalize?: (item: any) => any
): T {
  let stored: string | null;
  try {
    stored = localStorage.getItem(key);
  } catch {
    return fallback;
  }
  if (!stored) return fallback;

  try {
    const parsed = JSON.parse(stored);
    if (parsed === null || parsed === undefined) return fallback;

    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      return (normalize ? parsed.map(normalize) : parsed) as T;
    }

    if (typeof fallback === "object") {
      if (typeof parsed !== "object" || Array.isArray(parsed)) return fallback;
      return { ...(fallback as object), ...parsed } as T;
    }

    return parsed as T;
  } catch {
    return fallback;
  }
}

function normalizeRecord(item: any): WorkRecord {
  return {
    id: item?.id || `record-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: item?.date || new Date().toISOString().split("T")[0],
    startAt: item?.startAt || "00:00",
    endAt: item?.endAt || "00:00",
    breakMinutes: typeof item?.breakMinutes === "number" ? item.breakMinutes : 0,
    memo: typeof item?.memo === "string" ? item.memo : undefined,
  };
}

function normalizePayslip(item: any): PayslipCheck {
  return {
    id: item?.id || `payslip-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: item?.date || new Date().toISOString().split("T")[0],
    grossAmount: typeof item?.grossAmount === "number" ? item.grossAmount : 0,
    deductions: typeof item?.deductions === "number" ? item.deductions : 0,
    netAmount: typeof item?.netAmount === "number" ? item.netAmount : 0,
    memo: typeof item?.memo === "string" ? item.memo : undefined,
  };
}

export function getRecords(): WorkRecord[] {
  return safeParse<WorkRecord[]>(RECORDS_KEY, [], normalizeRecord);
}

export function setRecords(records: WorkRecord[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // localStorage 접근 불가(시크릿 모드 등) — 조용히 무시
  }
}

export function getPayslips(): PayslipCheck[] {
  return safeParse<PayslipCheck[]>(PAYSLIPS_KEY, [], normalizePayslip);
}

export function setPayslips(payslips: PayslipCheck[]): void {
  try {
    localStorage.setItem(PAYSLIPS_KEY, JSON.stringify(payslips));
  } catch {
    // localStorage 접근 불가 — 조용히 무시
  }
}

export function getSettings(): Settings {
  return safeParse<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function setSettings(settings: Partial<Settings>): void {
  try {
    const merged = { ...getSettings(), ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  } catch {
    // localStorage 접근 불가 — 조용히 무시
  }
}

export function getMeta(): Meta {
  return safeParse<Meta>(META_KEY, DEFAULT_META);
}

export function setMeta(meta: Partial<Meta>): void {
  try {
    const merged = { ...getMeta(), ...meta };
    localStorage.setItem(META_KEY, JSON.stringify(merged));
  } catch {
    // localStorage 접근 불가 — 조용히 무시
  }
}
