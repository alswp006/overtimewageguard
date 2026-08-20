import type { ReactNode } from "react";
import { tdsColor } from "@/lib/theme";

type CardProps = {
  children: ReactNode;
  testId?: string;
};

export default function Card({ children, testId }: CardProps) {
  return (
    <div
      data-testid={testId}
      style={{
        margin: "0 20px 12px",
        padding: 20,
        borderRadius: 16,
        backgroundColor: tdsColor.surface,
        color: tdsColor.text,
      }}
    >
      {children}
    </div>
  );
}
