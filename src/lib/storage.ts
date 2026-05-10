export type MinimumAction =
  | "walk20"
  | "walk5"
  | "bananaOnly"
  | "curtain"
  | "window1"
  | "bananaBite"
  | "entrance";

export interface DailyRecord {
  date: string;
  walked: boolean;
  walkMinutes: number;
  ateBanana: boolean;
  memo: string;
  completed: boolean;
  recoveryCompleted?: boolean;
  moodBefore?: number;
  moodAfter?: number;
  morningWeight?: "heavy" | "normal" | "light";
  selectedMinimumAction?: MinimumAction;
}

export interface NightPrep {
  date: string;
  bananaPrepared: boolean;
  shoesPrepared: boolean;
  clothesPrepared: boolean;
  alarmSet: boolean;
  alarmNameSet: boolean;
  tomorrowMinimumAction: "walk20" | "walk5" | "bananaOnly";
  messageToTomorrowSelf: string;
}

export interface Settings {
  timerMinutes: number;
}

const RECORDS_KEY = "asa_banana_records";
const SETTINGS_KEY = "asa_banana_settings";
const NIGHT_PREP_KEY = "asa_banana_night_prep";

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getAllRecords(): DailyRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getRecord(date: string): DailyRecord | null {
  return getAllRecords().find((r) => r.date === date) ?? null;
}

export function getTodayRecord(): DailyRecord {
  const today = getTodayString();
  return (
    getRecord(today) ?? {
      date: today,
      walked: false,
      walkMinutes: 0,
      ateBanana: false,
      memo: "",
      completed: false,
    }
  );
}

export function saveRecord(record: DailyRecord): void {
  if (typeof window === "undefined") return;
  const records = getAllRecords();
  const idx = records.findIndex((r) => r.date === record.date);
  const updated: DailyRecord = {
    ...record,
    completed: record.walked && record.ateBanana,
  };
  if (idx >= 0) {
    records[idx] = updated;
  } else {
    records.push(updated);
  }
  records.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function getSettings(): Settings {
  if (typeof window === "undefined") return { timerMinutes: 20 };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as Settings) : { timerMinutes: 20 };
  } catch {
    return { timerMinutes: 20 };
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getNightPrep(date: string): NightPrep | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${NIGHT_PREP_KEY}_${date}`);
    return raw ? (JSON.parse(raw) as NightPrep) : null;
  } catch {
    return null;
  }
}

export function saveNightPrep(prep: NightPrep): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${NIGHT_PREP_KEY}_${prep.date}`, JSON.stringify(prep));
}

export function getYesterdaysNightPrep(): NightPrep | null {
  return getNightPrep(getYesterdayString());
}

export function getTodaysNightPrep(): NightPrep | null {
  return getNightPrep(getTodayString());
}
