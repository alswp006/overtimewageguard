import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getRecords, setRecords, getPayslips } from "@/lib/storage";

// 실제 src/lib/storage.ts를 import해서 검증한다 — QA가 지적한 "가짜 커버리지"(자체 mock만 검증)를 보완.
describe("storage.ts 실제 구현 — 손상 데이터/저장 실패 방어", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("배열 항목이 null/숫자/문자열이면 유령 기록을 만들지 않고 버린다", () => {
    localStorage.setItem("owg.records.v1", JSON.stringify([null, 3, "x"]));
    expect(getRecords()).toEqual([]);
  });

  it("배열 항목이 null/숫자/문자열이면 유령 급여명세서도 버린다", () => {
    localStorage.setItem("owg.payslips.v1", JSON.stringify([null, 42, "y"]));
    expect(getPayslips()).toEqual([]);
  });

  it("endAt이 없는 진행중 기록은 저장 왕복 후에도 완료 기록으로 조작되지 않는다", () => {
    localStorage.setItem(
      "owg.records.v1",
      JSON.stringify([
        { id: "r1", date: "2026-08-21", startAt: "09:00", endAt: null, breakMinutes: 0 },
      ])
    );
    const [record] = getRecords();
    expect(record.endAt).toBeNull();
  });

  it("정상 항목은 그대로 유지된다", () => {
    localStorage.setItem(
      "owg.records.v1",
      JSON.stringify([
        { id: "r1", date: "2026-08-20", startAt: "09:00", endAt: "18:00", breakMinutes: 60 },
      ])
    );
    expect(getRecords()).toEqual([
      { id: "r1", date: "2026-08-20", startAt: "09:00", endAt: "18:00", breakMinutes: 60 },
    ]);
  });

  it("setRecords가 저장 용량 초과로 실패하면 false를 반환한다(호출자가 롤백할 수 있도록)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(setRecords([{ id: "r1", date: "2026-08-21", startAt: "09:00", endAt: "18:00", breakMinutes: 0 }])).toBe(
      false
    );
  });
});
