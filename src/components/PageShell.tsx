import type { ReactNode } from "react";
import { tdsColor } from "@/lib/theme";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        backgroundColor: tdsColor.background,
        color: tdsColor.text,
      }}
    >
      {children}
    </div>
  );
}
