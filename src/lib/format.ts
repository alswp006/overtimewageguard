// 로컬(기기) 타임존 기준 YYYY-MM-DD. new Date().toISOString()은 UTC라 자정 근처 KST 사용자의 날짜가 하루 밀린다.
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalMonthString(date: Date = new Date()): string {
  return getLocalDateString(date).slice(0, 7);
}

export function formatWon(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${safeAmount.toLocaleString("ko-KR")}원`;
}

export function formatHours(minutes: number): string {
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
  return `${Math.round(safeMinutes / 60)}시간`;
}
