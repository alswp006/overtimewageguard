import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Paragraph, Spacing, Top } from "@toss/tds-mobile";
import ScreenScaffold from "@/components/ScreenScaffold";
import Card from "@/components/Card";
import { useRecords } from "@/hooks/useRecords";
import { useSettings } from "@/hooks/useSettings";
import { computeMonthlySummary } from "@/lib/calc";
import { formatHours, formatWon } from "@/lib/format";
import { tdsColor } from "@/lib/theme";

export default function HomePage() {
  const navigate = useNavigate();
  const { records } = useRecords();
  const { settings } = useSettings();

  const summary = useMemo(() => computeMonthlySummary(records, settings), [records, settings]);

  return (
    <ScreenScaffold top={<Top title="이번 달 초과근무수당" />}>
      <Card testId="home-summary-card">
        <Paragraph typography="st3" color={tdsColor.textSecondary}>
          이번 달 예상 급여
        </Paragraph>
        <Spacing size={4} />
        <Paragraph typography="t2" fontWeight="bold">
          {formatWon(summary.totalWage)}
        </Paragraph>
        <Spacing size={4} />
        <Paragraph typography="st4" color={tdsColor.textSecondary}>
          초과근무 {formatHours(summary.totalOvertimeMinutes)} 포함
        </Paragraph>
      </Card>
      <Card testId="home-actions-card">
        <Button display="block" onClick={() => navigate("/records")}>
          출퇴근 기록하기
        </Button>
        <Spacing size={8} />
        <Button display="block" variant="weak" onClick={() => navigate("/report")}>
          급여 리포트 보기
        </Button>
      </Card>
    </ScreenScaffold>
  );
}
