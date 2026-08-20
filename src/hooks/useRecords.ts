import { useCallback, useState } from "react";
import type { WorkRecord } from "@/lib/types";
import { getRecords, setRecords as saveRecords } from "@/lib/storage";

export function useRecords() {
  const [records, setRecordsState] = useState<WorkRecord[]>(() => getRecords());

  const addRecord = useCallback((record: WorkRecord) => {
    setRecordsState((prev) => {
      const next = [...prev, record];
      saveRecords(next);
      return next;
    });
  }, []);

  const updateRecord = useCallback((id: string, patch: Partial<WorkRecord>) => {
    setRecordsState((prev) => {
      const next = prev.map((record) => (record.id === id ? { ...record, ...patch } : record));
      saveRecords(next);
      return next;
    });
  }, []);

  const removeRecord = useCallback((id: string) => {
    setRecordsState((prev) => {
      const next = prev.filter((record) => record.id !== id);
      saveRecords(next);
      return next;
    });
  }, []);

  return { records, addRecord, updateRecord, removeRecord };
}
