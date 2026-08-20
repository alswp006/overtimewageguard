import { useMemo, useState } from "react";
import { ListRow, Paragraph, Top } from "@toss/tds-mobile";
import ScreenScaffold from "@/components/ScreenScaffold";
import Card from "@/components/Card";
import { SubmitFooter } from "@/components/BottomCTA";
import EmptyState from "@/components/EmptyState";
import { useRecords } from "@/hooks/useRecords";
import { findActiveRecord, generateRecordId } from "@/lib/calc";
import type { WorkRecord } from "@/lib/types";
import { tdsColor } from "@/lib/theme";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function RecordsPage() {
  const { records, addRecord, updateRecord } = useRecords();
  const [today] = useState(() => todayDate());

  const activeRecord = useMemo(() => findActiveRecord(records, today), [records, today]);

  const handleClockIn = () => {
    if (findActiveRecord(records, today)) return;
    const record: WorkRecord = {
      id: generateRecordId(today, records),
      date: today,
      startAt: nowTime(),
      endAt: null as unknown as string,
      breakMinutes: 0,
    };
    addRecord(record);
  };

  const handleClockOut = () => {
    if (!activeRecord) return;
    updateRecord(activeRecord.id, { endAt: nowTime() });
  };

  const sortedRecords = useMemo(
    () => [...(records ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  return (
    <ScreenScaffold
      top={<Top title="출퇴근 기록" />}
      bottom={
        <SubmitFooter onClick={activeRecord ? handleClockOut : handleClockIn}>
          {activeRecord ? "퇴근 기록하기" : "출근 기록하기"}
        </SubmitFooter>
      }
    >
      {sortedRecords.length === 0 ? (
        <EmptyState title="기록이 아직 없어요" description="출근 버튼을 눌러 첫 기록을 시작해요" />
      ) : (
        <Card testId="records-list-card">
          {sortedRecords.map((record) => {
            const isActive = record.endAt === null || record.endAt === undefined || record.endAt === "";
            const detail = isActive
              ? `${record.startAt} ~ 근무중`
              : `${record.startAt} ~ ${record.endAt} · 휴게 ${record.breakMinutes || 0}분`;
            return (
              <ListRow
                key={record.id}
                border="none"
                contents={
                  <div>
                    <Paragraph typography="st2" fontWeight="bold">
                      {record.date}
                    </Paragraph>
                    <Paragraph typography="st4" color={tdsColor.textSecondary}>
                      {detail}
                    </Paragraph>
                  </div>
                }
              />
            );
          })}
        </Card>
      )}
    </ScreenScaffold>
  );
}
