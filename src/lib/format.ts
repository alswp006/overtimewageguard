export function formatWon(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${safeAmount.toLocaleString("ko-KR")}원`;
}

export function formatHours(minutes: number): string {
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
  return `${Math.round(safeMinutes / 60)}시간`;
}
