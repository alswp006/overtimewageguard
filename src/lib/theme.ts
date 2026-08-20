// @AI:NOTE 색상 토큰 단일 출처.
// 값은 항상 var(--tds-color-*) 형태로만 쓰고, HEX는 어디에도 쓰지 않는다.
// 체인: 앱 토큰(--tds-color-*) → TDS 어댑티브 토큰(--adaptive*) → CSS 시스템 색상.
// 세 단계 모두 라이트/다크에 따라 값이 뒤집히므로 다크모드 대비가 깨지지 않는다.
export const tdsColor = {
  /** 화면 배경 */
  background: "var(--tds-color-background, var(--adaptiveBackground, Canvas))",
  /** 카드·박스 배경 */
  surface: "var(--tds-color-surface, var(--adaptiveGrey50, var(--adaptiveBackgroundLevel01, Canvas)))",
  /** 본문 텍스트 */
  text: "var(--tds-color-text, var(--adaptiveGrey900, CanvasText))",
  /** 보조 설명 텍스트 */
  textSecondary: "var(--tds-color-text-secondary, var(--adaptiveGrey600, GrayText))",
  /** 1차 액션 배경 */
  primary: "var(--tds-color-primary, var(--adaptiveBlue500, LinkText))",
  /** 1차 액션 위 텍스트 (라이트·다크 모두 흰색 유지) */
  onPrimary: "var(--tds-color-on-primary, white)",
} as const;
