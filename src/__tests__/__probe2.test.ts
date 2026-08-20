import { describe, it, expect, vi } from "vitest";
import React from "react";

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
    }
  );
});

describe("probe2", () => {
  it("imports tds-mobile mock directly", async () => {
    const m = await import("@toss/tds-mobile");
    expect(m).toBeTruthy();
  });
});
