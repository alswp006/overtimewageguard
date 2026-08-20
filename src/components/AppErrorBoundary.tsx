import { Component, type ReactNode } from "react";
import { Paragraph, Spacing, Top } from "@toss/tds-mobile";
import ScreenScaffold from "@/components/ScreenScaffold";
import Card from "@/components/Card";
import { tdsColor } from "@/lib/theme";

type AppErrorBoundaryProps = {
  children: ReactNode;
  /** 폴백 제목 — 라우트별로 다르게 주고 싶을 때만 */
  title?: string;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

/**
 * 라우트 하나를 감싸는 렌더 예외 격리막.
 * 한 화면이 throw해도 앱 전체가 흰 화면이 되지 않고 이 폴백만 뜬다.
 */
export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // 화면 단위 격리가 목적이므로 여기서는 상태만 유지한다.
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <ScreenScaffold top={<Top title={this.props.title ?? "화면을 열지 못했어요"} />}>
        <Card testId="error-fallback-card">
          <Paragraph typography="t4" fontWeight="bold" color={tdsColor.text}>
            잠시 문제가 생겼어요
          </Paragraph>
          <Spacing size={8} />
          <Paragraph typography="st4" color={tdsColor.textSecondary}>
            기록은 그대로 있어요. 다시 시도하면 이 화면만 새로 그려요.
          </Paragraph>
          <Spacing size={20} />
          {/* @AI:NOTE 폴백은 TDS 렌더가 실패한 상황에서도 눌려야 하므로
              TDS Button 대신 토큰으로 스타일링한 네이티브 button을 쓴다.
              (최소 터치 타겟 48px, 전체폭) */}
          <button
            type="button"
            data-testid="error-retry-button"
            onClick={this.handleRetry}
            style={{
              display: "block",
              width: "100%",
              minHeight: 48,
              padding: "12px 16px",
              border: "none",
              borderRadius: 12,
              backgroundColor: tdsColor.primary,
              color: tdsColor.onPrimary,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </Card>
      </ScreenScaffold>
    );
  }
}
