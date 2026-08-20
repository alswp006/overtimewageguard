import type { ReactNode } from "react";

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
        background: "#f8f9fa",
      }}
    >
      {children}
    </div>
  );
}
