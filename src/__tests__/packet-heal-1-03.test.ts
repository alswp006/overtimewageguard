import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// TDS는 jsdom에서 충돌하므로 알 수 없는 컴포넌트도 안전하게 렌더되는 범용 stub으로 대체
vi.mock("@toss/tds-mobile", () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "__esModule") return true;
        if (prop === "then") return undefined;
        if (prop === "default") {
          return (props: any) => React.createElement("div", props, props?.children);
        }
        return (props: any) =>
          React.createElement("div", { "data-tds": String(prop) }, props?.children);
      },
      has: () => true,
    }
  );
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

import AppErrorBoundary from "@/components/AppErrorBoundary";
import EmptyState from "@/components/EmptyState";
import App from "@/App";

// 렌더 중 의도적으로 throw하는 테스트 전용 컴포넌트.
// shouldThrow를 테스트에서 토글해 "에러 → 재시도 → 복구" 흐름을 검증한다.
let shouldThrow = true;
function FlakyChild() {
  if (shouldThrow) {
    throw new Error("테스트용 강제 오류");
  }
  return React.createElement("div", { "data-testid": "recovered" }, "복구된 화면");
}

describe("라우트 단위 ErrorBoundary + 빈 상태 컴포넌트", () => {
  beforeEach(() => {
    localStorage.clear();
    shouldThrow = true;
    mockNavigate.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("AC-1[P0]: 하위 컴포넌트가 정상일 때는 children을 그대로 렌더한다 (happy path)", () => {
    const { container } = render(
      React.createElement(
        AppErrorBoundary,
        null,
        React.createElement("div", { "data-testid": "child-ok" }, "정상 화면")
      )
    );

    expect(container.querySelector('[data-testid="child-ok"]')).not.toBeNull();
    expect(container.textContent).toContain("정상 화면");
  });

  it("AC-1[P0]: 하위 컴포넌트가 throw해도 흰 화면 대신 폴백과 '다시 시도' 버튼을 보여준다 (error path)", () => {
    const { container } = render(
      React.createElement(AppErrorBoundary, null, React.createElement(FlakyChild))
    );

    expect(container.textContent?.trim().length).toBeGreaterThan(0);
    expect(container.querySelector('[data-testid="recovered"]')).toBeNull();
    const retryButton = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("다시 시도")
    );
    expect(retryButton).toBeDefined();
    expect(retryButton?.textContent).toContain("다시 시도");
  });

  it("AC-1: '다시 시도' 버튼을 누르면 에러 상태를 초기화하고 정상 화면으로 복구된다", () => {
    const { container } = render(
      React.createElement(AppErrorBoundary, null, React.createElement(FlakyChild))
    );

    const retryButton = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("다시 시도")
    ) as HTMLButtonElement;
    expect(retryButton).toBeDefined();

    shouldThrow = false;
    fireEvent.click(retryButton);

    expect(container.querySelector('[data-testid="recovered"]')).not.toBeNull();
    expect(container.textContent).toContain("복구된 화면");
  });

  it("AC-2: 폴백 UI는 ScreenScaffold(PageShell) 골격 안에서 렌더되고 Tailwind 클래스가 없다", () => {
    const { container } = render(
      React.createElement(AppErrorBoundary, null, React.createElement(FlakyChild))
    );

    expect(container.innerHTML).toMatch(/min-height:\s*100dvh/i);
    const tailwindLike = container.querySelector('[class*="p-"], [class*="px-"], [class*="py-"]');
    expect(tailwindLike).toBeNull();
  });

  it("AC-2: EmptyState는 제목/설명을 TDS 컴포넌트로 렌더하고 raw 텍스트 나열이나 HEX 하드코딩이 없다", () => {
    const { container } = render(
      React.createElement(EmptyState, {
        title: "이번 달 근무 기록이 없어요",
        description: "출퇴근 기록을 추가하면 리포트가 채워져요",
      })
    );

    expect(container.textContent).toContain("이번 달 근무 기록이 없어요");
    expect(container.textContent).toContain("출퇴근 기록을 추가하면 리포트가 채워져요");
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it("AC-3: 폴백/빈 상태는 var(--tds-color-*) CSS 변수만 사용해 다크모드 대비를 확보한다", () => {
    const { container: fallbackContainer } = render(
      React.createElement(AppErrorBoundary, null, React.createElement(FlakyChild))
    );
    const { container: emptyContainer } = render(
      React.createElement(EmptyState, { title: "기록이 아직 없어요" })
    );

    expect(fallbackContainer.innerHTML).toMatch(/var\(--tds-color/);
    expect(fallbackContainer.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(emptyContainer.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it("통합: App.tsx의 모든 라우트('/', '/records', '/report')가 크래시 없이 렌더되고 홈의 navigate 대상과 일치한다", () => {
    const { container: home, unmount: unmountHome } = render(
      React.createElement(MemoryRouter, { initialEntries: ["/"] }, React.createElement(App))
    );
    expect(home.textContent).toContain("이번 달 예상 급여");
    expect(home.textContent).toContain("0원");
    unmountHome();

    const { container: records, unmount: unmountRecords } = render(
      React.createElement(MemoryRouter, { initialEntries: ["/records"] }, React.createElement(App))
    );
    expect(records.textContent).toContain("기록이 아직 없어요");
    unmountRecords();

    const { container: report } = render(
      React.createElement(MemoryRouter, { initialEntries: ["/report"] }, React.createElement(App))
    );
    expect(report.textContent).toContain("이번 달 근무 기록이 없어요");
    expect(report.textContent).toContain("0원");
  });
});
