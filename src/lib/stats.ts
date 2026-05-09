import { DailyRecord } from "./storage";

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  monthlyComplete: number;
  monthlyRate: number;
  totalWalks: number;
  totalWalkMinutes: number;
  bananaCount: number;
  completeCount: number;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateCurrentStreak(records: DailyRecord[]): number {
  const completed = records
    .filter((r) => r.completed)
    .map((r) => r.date)
    .sort()
    .reverse();

  if (completed.length === 0) return 0;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  if (completed[0] !== todayStr && completed[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < completed.length; i++) {
    const prev = parseDate(completed[i - 1]);
    const curr = parseDate(completed[i]);
    if (diffDays(prev, curr) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function calculateLongestStreak(records: DailyRecord[]): number {
  const completed = records
    .filter((r) => r.completed)
    .map((r) => r.date)
    .sort();

  if (completed.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < completed.length; i++) {
    const prev = parseDate(completed[i - 1]);
    const curr = parseDate(completed[i]);
    if (diffDays(curr, prev) === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

export function calculateMonthlyComplete(
  records: DailyRecord[],
  year: number,
  month: number
): number {
  return records.filter((r) => {
    const d = parseDate(r.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month && r.completed;
  }).length;
}

export function calculateMonthlyRate(
  records: DailyRecord[],
  year: number,
  month: number
): number {
  const today = new Date();
  const daysInMonth =
    year === today.getFullYear() && month === today.getMonth() + 1
      ? today.getDate()
      : new Date(year, month, 0).getDate();

  const complete = calculateMonthlyComplete(records, year, month);
  return daysInMonth > 0 ? Math.round((complete / daysInMonth) * 100) : 0;
}

export function calculateStats(records: DailyRecord[]): Stats {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  return {
    currentStreak: calculateCurrentStreak(records),
    longestStreak: calculateLongestStreak(records),
    monthlyComplete: calculateMonthlyComplete(records, year, month),
    monthlyRate: calculateMonthlyRate(records, year, month),
    totalWalks: records.filter((r) => r.walked).length,
    totalWalkMinutes: records.reduce((sum, r) => sum + (r.walkMinutes || 0), 0),
    bananaCount: records.filter((r) => r.ateBanana).length,
    completeCount: records.filter((r) => r.completed).length,
  };
}
