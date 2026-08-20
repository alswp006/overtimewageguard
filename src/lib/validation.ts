export type ValidationResult = { valid: boolean; message?: string };

const ok: ValidationResult = { valid: true };

function invalid(message: string): ValidationResult {
  return { valid: false, message };
}

export function validateHourlyWage(value: number): ValidationResult {
  if (!Number.isFinite(value)) return invalid("시급을 숫자로 입력해 주세요");
  if (value < 0) return invalid("시급은 0원 이상이어야 해요");
  if (value > 10_000_000) return invalid("시급이 너무 커요. 다시 확인해 주세요");
  return ok;
}

export function validateMonthlySalary(value: number): ValidationResult {
  if (!Number.isFinite(value)) return invalid("월급을 숫자로 입력해 주세요");
  if (value < 0) return invalid("월급은 0원 이상이어야 해요");
  if (value > 1_000_000_000) return invalid("월급이 너무 커요. 다시 확인해 주세요");
  return ok;
}

export function validateMonthlyStandardHours(value: number): ValidationResult {
  if (!Number.isFinite(value)) return invalid("소정근로시간을 숫자로 입력해 주세요");
  if (value <= 0) return invalid("소정근로시간은 0보다 커야 해요");
  if (value > 744) return invalid("소정근로시간이 너무 커요. 다시 확인해 주세요");
  return ok;
}

export function validateBreakMinutes(value: number): ValidationResult {
  if (!Number.isFinite(value)) return invalid("휴게시간을 숫자로 입력해 주세요");
  if (value < 0) return invalid("휴게시간은 0분 이상이어야 해요");
  if (value > 1440) return invalid("휴게시간이 하루를 넘을 수 없어요");
  return ok;
}

export function sanitizeMonthlyStandardHours(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 209;
  return value;
}
