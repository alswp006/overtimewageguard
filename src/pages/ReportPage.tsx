import { useMemo } from "react";
import { ListRow, Paragraph, Spacing, Top } from "@toss/tds-mobile";
import ScreenScaffold from "@/components/ScreenScaffold";
import Card from "@/components/Card";
import { EmptyState } from "@/components/StateView";
import { useRecords } from "@/hooks/useRecords";
import { useSettings } from "@/hooks/useSettings";
import { computeMonthlySummary } from "@/lib/calc";
import { formatHours, formatWon } from "@/lib/format";

export default function ReportPage() {
  const { records } = useRecords();
  const { settings } = useSettings();

  const summary = useMemo(() => computeMonthlySummary(records, settings), [records, settings]);
  const hasRecords = (records ?? []).length > 0;

  return (
    <ScreenScaffold top={<Top title="급여 리포트" />}>
      {!hasRecords ? (
        <EmptyState title="이번 달 근무 기록이 없어요" description="출퇴근 기록을 추가하면 리포트가 채워져요" />
      ) : null}
      <Card testId="report-summary-card">
        <Paragraph typography="st3" color="#6b7684">
          이번 달 예상 급여
        </Paragraph>
        <Spacing size={4} />
        <Paragraph typography="t2" fontWeight="bold">
          {formatWon(summary.totalWage)}
        </Paragraph>
        <Spacing size={12} />
        <ListRow
          border="none"
          contents={<Paragraph typography="st3">근무 일수</Paragraph>}
          right={<Paragraph typography="st3">{summary.dayCount}일</Paragraph>}
        />
        <ListRow
          border="none"
          contents={<Paragraph typography="st3">총 근무 시간</Paragraph>}
          right={<Paragraph typography="st3">{formatHours(summary.totalWorkedMinutes)}</Paragraph>}
        />
        <ListRow
          border="none"
          contents={<Paragraph typography="st3">초과근무 시간</Paragraph>}
          right={<Paragraph typography="st3">{formatHours(summary.totalOvertimeMinutes)}</Paragraph>}
        />
      </Card>
    </ScreenScaffold>
  );
}
