import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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

describe("probe", () => {
  it("renders HomePage", async () => {
    const HomePage = (await import("@/pages/HomePage")).default;
    const { container } = render(
      React.createElement(MemoryRouter, null, React.createElement(HomePage))
    );
    expect(container).toBeTruthy();
  });

  it("renders RecordsPage", async () => {
    const RecordsPage = (await import("@/pages/RecordsPage")).default;
    const { container } = render(
      React.createElement(MemoryRouter, null, React.createElement(RecordsPage))
    );
    expect(container).toBeTruthy();
  });

  it("renders ReportPage", async () => {
    const ReportPage = (await import("@/pages/ReportPage")).default;
    const { container } = render(
      React.createElement(MemoryRouter, null, React.createElement(ReportPage))
    );
    expect(container).toBeTruthy();
  });
  it("imports web-framework", async () => {
    const m = await import("@apps-in-toss/web-framework");
    expect(m).toBeTruthy();
  });

  it("imports calc", async () => {
    const m = await import("@/lib/calc");
    expect(m).toBeTruthy();
  });

  it("imports validation", async () => {
    const m = await import("@/lib/validation");
    expect(m).toBeTruthy();
  });

  it("imports HomePage", async () => {
    const m = await import("@/pages/HomePage");
    expect(m).toBeTruthy();
  });

  it("imports RecordsPage", async () => {
    const m = await import("@/pages/RecordsPage");
    expect(m).toBeTruthy();
  });

  it("imports ReportPage", async () => {
    const m = await import("@/pages/ReportPage");
    expect(m).toBeTruthy();
  });
});
