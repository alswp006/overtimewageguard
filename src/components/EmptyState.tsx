import type { ReactNode } from "react";
import { Paragraph, Spacing } from "@toss/tds-mobile";
import { tdsColor } from "@/lib/theme";

type EmptyStateProps = {
  title: string;
  description?: string;
  /** 다음 행동 CTA — display="block" Button 또는 SubmitFooter를 넘긴다 */
  action?: ReactNode;
  testId?: string;
};

/**
 * 목록·리포트의 데이터 0건 상태를 한 가지 모양으로 통일한다.
 * 페이지가 이미 ScreenScaffold 안에 있으므로 여기서는 본문 블록만 그린다.
 */
export function EmptyState({ title, description, action, testId }: EmptyStateProps) {
  return (
    <div
      data-testid={testId ?? "empty-state"}
      style={{ padding: "56px 20px", textAlign: "center", color: tdsColor.text }}
    >
      <Paragraph typography="t4" fontWeight="bold" textAlign="center" color={tdsColor.text}>
        {title}
      </Paragraph>
      {description ? (
        <>
          <Spacing size={8} />
          <Paragraph typography="st4" textAlign="center" color={tdsColor.textSecondary}>
            {description}
          </Paragraph>
        </>
      ) : null}
      {action ? (
        <>
          <Spacing size={20} />
          {action}
        </>
      ) : null}
    </div>
  );
}

export default EmptyState;
