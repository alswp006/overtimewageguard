import type { WorkRecord, PayslipCheck, Settings } from "@/lib/types";
import { getLocalDateString } from "@/lib/format";

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
      if (!normalize) return parsed as T;
      return parsed.map(normalize).filter((item) => item !== null) as T;
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

function isPlainObject(value: any): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// item이 객체가 아니면(null/숫자/문자열 등 손상 데이터) 유령 기록을 만들지 않고 버린다(null 반환 → 필터링됨).
function normalizeRecord(item: any): WorkRecord | null {
  if (!isPlainObject(item)) return null;
  // endAt이 없는 진행중(출근만 한) 기록을 "00:00"으로 덮어쓰면 저장 왕복만으로 완료 기록처럼 조작된다 — null을 보존한다.
  const endAt = item.endAt === null || item.endAt === undefined || item.endAt === "" ? null : item.endAt;
  return {
    id: typeof item.id === "string" && item.id ? item.id : `record-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: typeof item.date === "string" && item.date ? item.date : getLocalDateString(),
    startAt: typeof item.startAt === "string" && item.startAt ? item.startAt : "00:00",
    endAt: endAt as unknown as string,
    breakMinutes: typeof item.breakMinutes === "number" ? item.breakMinutes : 0,
    memo: typeof item.memo === "string" ? item.memo : undefined,
  };
}

function normalizePayslip(item: any): PayslipCheck | null {
  if (!isPlainObject(item)) return null;
  return {
    id: typeof item.id === "string" && item.id ? item.id : `payslip-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: typeof item.date === "string" && item.date ? item.date : getLocalDateString(),
    grossAmount: typeof item.grossAmount === "number" ? item.grossAmount : 0,
    deductions: typeof item.deductions === "number" ? item.deductions : 0,
    netAmount: typeof item.netAmount === "number" ? item.netAmount : 0,
    memo: typeof item.memo === "string" ? item.memo : undefined,
  };
}

export function getRecords(): WorkRecord[] {
  return safeParse<WorkRecord[]>(RECORDS_KEY, [], normalizeRecord);
}

// 저장 성공 여부를 반환한다 — 호출자가 실패 시(용량 초과 등) 낙관적 상태 갱신을 롤백할 수 있어야 한다.
export function setRecords(records: WorkRecord[]): boolean {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export function getPayslips(): PayslipCheck[] {
  return safeParse<PayslipCheck[]>(PAYSLIPS_KEY, [], normalizePayslip);
}

export function setPayslips(payslips: PayslipCheck[]): boolean {
  try {
    localStorage.setItem(PAYSLIPS_KEY, JSON.stringify(payslips));
    return true;
  } catch {
    return false;
  }
}

export function getSettings(): Settings {
  return safeParse<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function setSettings(settings: Partial<Settings>): boolean {
  try {
    const merged = { ...getSettings(), ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return true;
  } catch {
    return false;
  }
}

export function getMeta(): Meta {
  return safeParse<Meta>(META_KEY, DEFAULT_META);
}

export function setMeta(meta: Partial<Meta>): boolean {
  try {
    const merged = { ...getMeta(), ...meta };
    localStorage.setItem(META_KEY, JSON.stringify(merged));
    return true;
  } catch {
    return false;
  }
}
