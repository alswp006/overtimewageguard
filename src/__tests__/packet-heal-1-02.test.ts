import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { WorkRecord, Settings } from "@/lib/types";
import {
  computeDay,
  computeMonthlySummary,
  findActiveRecord,
  generateRecordId,
} from "@/lib/calc";
import {
  validateHourlyWage,
  validateMonthlySalary,
  validateMonthlyStandardHours,
  validateBreakMinutes,
  sanitizeMonthlyStandardHours,
} from "@/lib/validation";
import HomePage from "@/pages/HomePage";
import RecordsPage from "@/pages/RecordsPage";
import ReportPage from "@/pages/ReportPage";

// TDS는 jsdom에서 충돌하므로 알 수 없는 컴포넌트도 안전하게 렌더되는 범용 stub으로 대체
vi.mock("@toss/tds-mobile", () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "__esModule") return true;
        if (prop === "default") {
          return (props: any) => React.createElement("div", props, props?.children);
        }
        return (props: any) =>
          React.createElement("div", { "data-tds": String(prop) }, props?.children);
      },
    }
  );
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

const SETTINGS: Settings = {
  payType: "hourly",
  hourlyWage: 12000,
  monthlySalary: 0,
  monthlyStandardHours: 209,
  defaultBreakMinutes: 60,
  isSmallBusiness: false,
};

// endAt은 "진행중" 기록을 표현하려면 null이어야 하는데 현재 WorkRecord.endAt 타입은 string이다.
// 계산기는 런타임에 null을 방어해야 하므로 테스트 픽스처는 캐스팅으로 null을 주입한다.
function asRecords(records: Array<Omit<WorkRecord, "endAt"> & { endAt: string | null }>): WorkRecord[] {
  return records as unknown as WorkRecord[];
}

describe("계산·리스트 로직의 빈/부분 데이터 방어 처리", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("AC-1[P0]: computeMonthlySummary는 기록 0건일 때 NaN/undefined 없이 전부 0을 반환한다", () => {
    const empty = computeMonthlySummary([], SETTINGS);
    const nullish = computeMonthlySummary(null, SETTINGS);
    const undef = computeMonthlySummary(undefined, SETTINGS);

    expect(empty).toEqual({
      totalWorkedMinutes: 0,
      totalOvertimeMinutes: 0,
      totalWage: 0,
      dayCount: 0,
    });
    expect(nullish).toEqual(empty);
    expect(undef).toEqual(empty);
    expect(Number.isNaN(empty.totalWage)).toBe(false);
  });

  it("AC-1[P0]: 기록이 없을 때 홈/기록/리포트 페이지가 크래시 없이 0원 빈 상태를 렌더한다", () => {
    const { container: home } = render(
      React.createElement(MemoryRouter, null, React.createElement(HomePage))
    );
    const { container: records } = render(
      React.createElement(MemoryRouter, null, React.createElement(RecordsPage))
    );
    const { container: report } = render(
      React.createElement(MemoryRouter, null, React.createElement(ReportPage))
    );

    expect(home.textContent).toContain("0원");
    expect(records.textContent).not.toContain("NaN");
    expect(report.textContent).toContain("0원");
    expect(report.textContent).not.toContain("undefined");
  });

  it("AC-2[P0]: 월간 집계는 endAt이 null인 진행중 기록을 건너뛰고 완료된 기록만 합산한다", () => {
    const records = asRecords([
      { id: "2026-08-01-1", date: "2026-08-01", startAt: "09:00", endAt: "18:00", breakMinutes: 60 },
      { id: "2026-08-02-1", date: "2026-08-02", startAt: "09:00", endAt: null, breakMinutes: 60 },
      { id: "2026-08-03-1", date: "2026-08-03", startAt: "09:00", endAt: "20:00", breakMinutes: 60 },
    ]);

    const summary = computeMonthlySummary(records, SETTINGS);

    expect(summary.dayCount).toBe(2);
    expect(summary.totalWorkedMinutes).toBe(1080);
    expect(summary.totalOvertimeMinutes).toBe(120);
    expect(summary.totalWage).toBe(228000);
  });

  it("AC-2[P0]: computeDay는 입력이 없거나 진행중 기록이면 크래시 대신 null을 반환한다", () => {
    const active = asRecords([
      { id: "2026-08-02-1", date: "2026-08-02", startAt: "09:00", endAt: null, breakMinutes: 60 },
    ])[0];
    const completed: WorkRecord = {
      id: "2026-08-01-1",
      date: "2026-08-01",
      startAt: "09:00",
      endAt: "18:00",
      breakMinutes: 60,
    };

    expect(computeDay(null, SETTINGS)).toBeNull();
    expect(computeDay(undefined, SETTINGS)).toBeNull();
    expect(computeDay(completed, null)).toBeNull();
    expect(computeDay(active, SETTINGS)).toBeNull();
    expect(computeDay(completed, SETTINGS)?.wage).toBe(96000);
  });

  it("AC-3[P1]: monthlyStandardHours가 0/NaN/음수면 검증 에러를 내고 sanitize는 0으로 나누기 방지를 위해 209로 폴백한다", () => {
    const zero = validateMonthlyStandardHours(0);
    const nan = validateMonthlyStandardHours(NaN);
    const ok = validateMonthlyStandardHours(209);

    expect(zero.valid).toBe(false);
    expect(typeof zero.message).toBe("string");
    expect(nan.valid).toBe(false);
    expect(ok.valid).toBe(true);

    expect(sanitizeMonthlyStandardHours(0)).toBe(209);
    expect(sanitizeMonthlyStandardHours(-5)).toBe(209);
    expect(sanitizeMonthlyStandardHours(NaN)).toBe(209);
    expect(sanitizeMonthlyStandardHours(160)).toBe(160);
  });

  it("AC-3[P1]: hourlyWage/monthlySalary/breakMinutes도 NaN·음수·범위초과를 막고 정상값은 통과시킨다", () => {
    expect(validateHourlyWage(NaN).valid).toBe(false);
    expect(validateHourlyWage(-1000).valid).toBe(false);
    expect(validateHourlyWage(12000).valid).toBe(true);

    expect(validateMonthlySalary(NaN).valid).toBe(false);
    expect(validateMonthlySalary(-100).valid).toBe(false);
    expect(validateMonthlySalary(3200000).valid).toBe(true);

    expect(validateBreakMinutes(NaN).valid).toBe(false);
    expect(validateBreakMinutes(-10).valid).toBe(false);
    expect(validateBreakMinutes(60).valid).toBe(true);
  });

  it("AC-4[P1]: 같은 날짜에 진행중 기록이 있으면 새로 만들지 않고 기존 기록을 반환한다", () => {
    const records = asRecords([
      { id: "2026-08-20-1", date: "2026-08-20", startAt: "09:00", endAt: "18:00", breakMinutes: 60 },
      { id: "2026-08-21-1", date: "2026-08-21", startAt: "09:30", endAt: null, breakMinutes: 60 },
    ]);

    const active = findActiveRecord(records, "2026-08-21");
    const noActiveForCompletedDate = findActiveRecord(records, "2026-08-20");
    const noRecordsAtAll = findActiveRecord([], "2026-08-21");

    expect(active?.id).toBe("2026-08-21-1");
    expect(active?.endAt).toBeNull();
    expect(noActiveForCompletedDate).toBeNull();
    expect(noRecordsAtAll).toBeNull();
  });

  it("AC-4[P1]: generateRecordId는 같은 날짜의 기록 수만큼 카운터를 증가시키고 다른 날짜와 충돌하지 않는다", () => {
    const firstId = generateRecordId("2026-08-21", []);
    const existing = asRecords([
      { id: "2026-08-21-1", date: "2026-08-21", startAt: "09:00", endAt: "18:00", breakMinutes: 60 },
    ]);
    const secondId = generateRecordId("2026-08-21", existing);
    const differentDateExisting = asRecords([
      { id: "2026-08-20-1", date: "2026-08-20", startAt: "09:00", endAt: "18:00", breakMinutes: 60 },
    ]);
    const unaffectedId = generateRecordId("2026-08-21", differentDateExisting);

    expect(firstId).toBe("2026-08-21-1");
    expect(secondId).toBe("2026-08-21-2");
    expect(unaffectedId).toBe("2026-08-21-1");
  });
});
