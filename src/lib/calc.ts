import type { WorkRecord, Settings } from "@/lib/types";
import { sanitizeMonthlyStandardHours } from "@/lib/validation";
import { getLocalMonthString } from "@/lib/format";

export type DayBreakdown = {
  workedMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  wage: number;
};

export type MonthlySummary = {
  totalWorkedMinutes: number;
  totalOvertimeMinutes: number;
  totalWage: number;
  dayCount: number;
};

const STANDARD_DAILY_MINUTES = 8 * 60;
const OVERTIME_MULTIPLIER = 1.5;

function isInProgress(endAt: WorkRecord["endAt"]): boolean {
  return endAt === null || endAt === undefined || endAt === "";
}

function parseTimeToMinutes(value: string): number | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function resolveHourlyRate(settings: Settings): number {
  const rate =
    settings.payType === "salary"
      ? settings.monthlySalary / sanitizeMonthlyStandardHours(settings.monthlyStandardHours)
      : settings.hourlyWage;
  return Number.isFinite(rate) && rate > 0 ? rate : 0;
}

/** 진행중(endAt 없음) 기록이거나 입력이 없으면 계산 대신 null을 반환한다. */
export function computeDay(
  record?: WorkRecord | null,
  settings?: Settings | null
): DayBreakdown | null {
  if (!record || !settings) return null;
  if (isInProgress(record.endAt)) return null;

  const startMinutes = parseTimeToMinutes(record.startAt);
  const endMinutes = parseTimeToMinutes(record.endAt);
  if (startMinutes === null || endMinutes === null) return null;

  const breakMinutes =
    Number.isFinite(record.breakMinutes) && record.breakMinutes > 0 ? record.breakMinutes : 0;

  let rawMinutes = endMinutes - startMinutes;
  if (rawMinutes < 0) rawMinutes += 24 * 60; // 자정을 넘긴 근무 방어
  const workedMinutes = Math.max(rawMinutes - breakMinutes, 0);

  const regularMinutes = Math.min(workedMinutes, STANDARD_DAILY_MINUTES);
  const overtimeMinutes = Math.max(workedMinutes - STANDARD_DAILY_MINUTES, 0);

  const rate = resolveHourlyRate(settings);
  const overtimeMultiplier = settings.isSmallBusiness ? 1 : OVERTIME_MULTIPLIER;
  const wage = (regularMinutes / 60) * rate + (overtimeMinutes / 60) * rate * overtimeMultiplier;

  return {
    workedMinutes,
    regularMinutes,
    overtimeMinutes,
    wage: Math.round(wage),
  };
}

const EMPTY_SUMMARY: MonthlySummary = {
  totalWorkedMinutes: 0,
  totalOvertimeMinutes: 0,
  totalWage: 0,
  dayCount: 0,
};

/** 이번 달(로컬 기준) 완료된 기록만 방어적으로 합산한다 — "이번 달" 표시와 어긋나지 않도록 월 범위를 강제한다. */
export function computeMonthlySummary(
  records?: WorkRecord[] | null,
  settings?: Settings | null
): MonthlySummary {
  if (!settings) return EMPTY_SUMMARY;

  const currentMonth = getLocalMonthString();
  const thisMonthRecords = (records ?? []).filter(
    (record) => record && typeof record.date === "string" && record.date.startsWith(currentMonth)
  );

  return thisMonthRecords.reduce((summary, record) => {
    const breakdown = computeDay(record, settings);
    if (!breakdown) return summary;
    return {
      totalWorkedMinutes: summary.totalWorkedMinutes + breakdown.workedMinutes,
      totalOvertimeMinutes: summary.totalOvertimeMinutes + breakdown.overtimeMinutes,
      totalWage: summary.totalWage + breakdown.wage,
      dayCount: summary.dayCount + 1,
    };
  }, EMPTY_SUMMARY);
}

/** 같은 날짜에 진행중 기록이 이미 있으면 그 기록을 반환하고, 없으면 null을 반환한다. */
export function findActiveRecord(
  records: WorkRecord[] | null | undefined,
  date: string
): WorkRecord | null {
  const found = (records ?? []).find(
    (record) => record && record.date === date && isInProgress(record.endAt)
  );
  return found ?? null;
}

/** 같은 날짜의 기존 기록 수만큼 카운터를 증가시켜 충돌 없는 id를 만든다. */
export function generateRecordId(date: string, records?: WorkRecord[] | null): string {
  const sameDateCount = (records ?? []).filter((record) => record && record.date === date).length;
  return `${date}-${sameDateCount + 1}`;
}
