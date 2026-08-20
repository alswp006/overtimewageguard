import type { ReactNode } from "react";
import { Paragraph, Spacing } from "@toss/tds-mobile";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div style={{ padding: "56px 20px", textAlign: "center" }}>
      <Paragraph typography="t4" fontWeight="bold" textAlign="center">
        {title}
      </Paragraph>
      {description ? (
        <>
          <Spacing size={8} />
          <Paragraph typography="st3" color="#6b7684" textAlign="center">
            {description}
          </Paragraph>
        </>
      ) : null}
      {action ? (
        <>
          <Spacing size={16} />
          {action}
        </>
      ) : null}
    </div>
  );
}
