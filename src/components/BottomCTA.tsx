import type { MouseEvent, ReactNode } from "react";
import { FixedBottomCTA } from "@toss/tds-mobile";
import { generateHapticFeedback } from "@apps-in-toss/web-framework";

type SubmitFooterProps = {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

export function SubmitFooter({ children, onClick, disabled }: SubmitFooterProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    try {
      void generateHapticFeedback({ type: "success" }).catch(() => {});
    } catch {
      // 햅틱 미지원 환경 — 무시
    }
    onClick?.(event);
  };

  return (
    <FixedBottomCTA display="block" onClick={handleClick} disabled={disabled}>
      {children}
    </FixedBottomCTA>
  );
}
