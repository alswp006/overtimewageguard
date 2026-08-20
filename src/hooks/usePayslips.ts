import { useCallback, useState } from "react";
import type { PayslipCheck } from "@/lib/types";
import { getPayslips, setPayslips as savePayslips } from "@/lib/storage";

export function usePayslips() {
  const [payslips, setPayslipsState] = useState<PayslipCheck[]>(() => getPayslips());

  const addPayslip = useCallback((payslip: PayslipCheck) => {
    setPayslipsState((prev) => {
      const next = [...prev, payslip];
      savePayslips(next);
      return next;
    });
  }, []);

  const updatePayslip = useCallback((id: string, patch: Partial<PayslipCheck>) => {
    setPayslipsState((prev) => {
      const next = prev.map((payslip) => (payslip.id === id ? { ...payslip, ...patch } : payslip));
      savePayslips(next);
      return next;
    });
  }, []);

  const removePayslip = useCallback((id: string) => {
    setPayslipsState((prev) => {
      const next = prev.filter((payslip) => payslip.id !== id);
      savePayslips(next);
      return next;
    });
  }, []);

  return { payslips, addPayslip, updatePayslip, removePayslip };
}
