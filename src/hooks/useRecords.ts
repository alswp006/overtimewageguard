import { useCallback, useState } from "react";
import type { WorkRecord } from "@/lib/types";
import { getRecords, setRecords as saveRecords } from "@/lib/storage";

export function useRecords() {
  const [records, setRecordsState] = useState<WorkRecord[]>(() => getRecords());

  // 저장이 실패하면(용량 초과 등) 화면 상태를 이전 값으로 되돌린다 — 저장 안 된 걸 저장된 것처럼 보여주지 않기 위함.
  const addRecord = useCallback((record: WorkRecord) => {
    setRecordsState((prev) => {
      const next = [...prev, record];
      return saveRecords(next) ? next : prev;
    });
  }, []);

  const updateRecord = useCallback((id: string, patch: Partial<WorkRecord>) => {
    setRecordsState((prev) => {
      const next = prev.map((record) => (record.id === id ? { ...record, ...patch } : record));
      return saveRecords(next) ? next : prev;
    });
  }, []);

  const removeRecord = useCallback((id: string) => {
    setRecordsState((prev) => {
      const next = prev.filter((record) => record.id !== id);
      return saveRecords(next) ? next : prev;
    });
  }, []);

  return { records, addRecord, updateRecord, removeRecord };
}
