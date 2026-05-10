import { DailyRecord } from "./storage";

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  currentActionStreak: number;
  monthlyComplete: number;
  monthlyRecovery: number;
  monthlyRate: number;
  totalWalks: number;
  totalWalkMinutes: number;
  bananaCount: number;
  completeCount: number;
  recoveryCount: number;
  moodImprovedDays: number;
  sevenDayProgress: number;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function todayStr(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcConsecutiveStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse();
  const today = todayStr();
  const yesterday = yesterdayStr();
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (diffDays(parseDate(sorted[i - 1]), parseDate(sorted[i])) === 1) streak++;
    else break;
  }
  return streak;
}

function calcLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (diffDays(parseDate(sorted[i]), parseDate(sorted[i - 1])) === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

export function calculateCurrentStreak(records: DailyRecord[]): number {
  return calcConsecutiveStreak(records.filter((r) => r.completed).map((r) => r.date));
}

export function calculateLongestStreak(records: DailyRecord[]): number {
  return calcLongestStreak(records.filter((r) => r.completed).map((r) => r.date));
}

export function calculateMonthlyComplete(records: DailyRecord[], year: number, month: number): number {
  return records.filter((r) => {
    const d = parseDate(r.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month && r.completed;
  }).length;
}

export function calculateMonthlyRate(records: DailyRecord[], year: number, month: number): number {
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

  const completeDates = records.filter((r) => r.completed).map((r) => r.date);
  const actionDates = records
    .filter((r) => r.completed || r.recoveryCompleted)
    .map((r) => r.date);

  const last7: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }
  const sevenDayProgress = records.filter(
    (r) => last7.includes(r.date) && (r.completed || r.recoveryCompleted)
  ).length;

  return {
    currentStreak: calcConsecutiveStreak(completeDates),
    longestStreak: calcLongestStreak(completeDates),
    currentActionStreak: calcConsecutiveStreak(actionDates),
    monthlyComplete: calculateMonthlyComplete(records, year, month),
    monthlyRecovery: records.filter((r) => {
      const d = parseDate(r.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month && r.recoveryCompleted && !r.completed;
    }).length,
    monthlyRate: calculateMonthlyRate(records, year, month),
    totalWalks: records.filter((r) => r.walked).length,
    totalWalkMinutes: records.reduce((s, r) => s + (r.walkMinutes || 0), 0),
    bananaCount: records.filter((r) => r.ateBanana).length,
    completeCount: records.filter((r) => r.completed).length,
    recoveryCount: records.filter((r) => r.recoveryCompleted && !r.completed).length,
    moodImprovedDays: records.filter(
      (r) => r.moodBefore !== undefined && r.moodAfter !== undefined && r.moodAfter > r.moodBefore
    ).length,
    sevenDayProgress,
  };
}
