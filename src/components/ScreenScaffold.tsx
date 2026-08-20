import type { ReactNode } from "react";
import PageShell from "@/components/PageShell";

type ScreenScaffoldProps = {
  top?: ReactNode;
  bottom?: ReactNode;
  children: ReactNode;
};

export default function ScreenScaffold({ top, bottom, children }: ScreenScaffoldProps) {
  return (
    <PageShell>
      {top}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: bottom ? 96 : 24 }}>
        {children}
      </div>
      {bottom}
    </PageShell>
  );
}
