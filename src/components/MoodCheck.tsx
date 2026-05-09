"use client";

import { DailyRecord, getTodayRecord, saveRecord, getAllRecords } from "@/lib/storage";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😫", label: "かなり重い" },
  { value: 2, emoji: "😔", label: "少し重い" },
  { value: 3, emoji: "😐", label: "ふつう" },
  { value: 4, emoji: "🙂", label: "少し軽い" },
  { value: 5, emoji: "😊", label: "すっきり" },
];

interface MoodSelectorProps {
  type: "before" | "after";
  currentValue?: number;
  onSave: (value: number) => void;
}

export function MoodSelector({ type, currentValue, onSave }: MoodSelectorProps) {
  const isBefore = type === "before";
  const label = isBefore ? "今の気分は？（散歩前）" : "歩いた後の気分は？";
  const color = isBefore ? "amber" : "green";

  return (
    <div className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4`}>
      <p className={`text-sm font-bold text-${color}-700 mb-3`}>{label}</p>
      <div className="flex gap-1">
        {MOOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSave(opt.value)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all active:scale-95 ${
              currentValue === opt.value
                ? `bg-${color}-200 border-${color}-400`
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-xs text-gray-500 leading-tight text-center">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface MoodHistoryProps {
  records?: DailyRecord[];
}

export function MoodHistory({ records }: MoodHistoryProps) {
  const allRecords = records ?? getAllRecords();
  const last7 = allRecords
    .filter((r) => r.moodBefore !== undefined || r.moodAfter !== undefined)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)
    .reverse();

  const improvedDays = last7.filter(
    (r) => r.moodBefore !== undefined && r.moodAfter !== undefined && r.moodAfter > r.moodBefore
  ).length;

  if (last7.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <p className="text-sm">気分の記録はまだありません</p>
        <p className="text-xs mt-1">散歩前後の気分を記録すると、ここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {improvedDays > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
          <p className="text-green-700 text-sm font-semibold">
            🌿 歩いた後、少し軽くなった日：{improvedDays}日
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50">
          <p className="text-sm font-semibold text-gray-600">過去7日間の気分変化</p>
        </div>
        <div className="divide-y divide-gray-50">
          {last7.map((r) => {
            const [, m, d] = r.date.split("-");
            const before = r.moodBefore;
            const after = r.moodAfter;
            const improved = before !== undefined && after !== undefined && after > before;
            const unchanged = before !== undefined && after !== undefined && after === before;
            return (
              <div key={r.date} className="px-4 py-3 flex items-center gap-3">
                <span className="text-xs text-gray-400 w-10 flex-shrink-0">{m}/{d}</span>
                <div className="flex items-center gap-2 flex-1">
                  {before !== undefined && (
                    <span className="text-xl">{MOOD_OPTIONS[before - 1].emoji}</span>
                  )}
                  {before !== undefined && after !== undefined && (
                    <span className={`text-sm ${improved ? "text-green-500" : unchanged ? "text-gray-400" : "text-orange-400"}`}>
                      {improved ? "→ 少し軽くなった" : unchanged ? "→ 変わらず" : "→"}
                    </span>
                  )}
                  {after !== undefined && (
                    <span className="text-xl">{MOOD_OPTIONS[after - 1].emoji}</span>
                  )}
                  {before === undefined && after !== undefined && (
                    <span className="text-xs text-gray-400">散歩後のみ記録</span>
                  )}
                </div>
                {r.walked && <span className="text-xs text-green-400">🚶</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface MoodCheckProps {
  todayRecord: DailyRecord;
  onUpdate: () => void;
}

export default function MoodCheck({ todayRecord, onUpdate }: MoodCheckProps) {
  const handleSaveBefore = (value: number) => {
    const current = getTodayRecord();
    saveRecord({ ...current, moodBefore: value });
    onUpdate();
  };

  const handleSaveAfter = (value: number) => {
    const current = getTodayRecord();
    saveRecord({ ...current, moodAfter: value });
    onUpdate();
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">気分ビフォーアフター</h2>

      <MoodSelector type="before" currentValue={todayRecord.moodBefore} onSave={handleSaveBefore} />

      {todayRecord.walked && (
        <MoodSelector type="after" currentValue={todayRecord.moodAfter} onSave={handleSaveAfter} />
      )}

      {!todayRecord.walked && (
        <p className="text-xs text-gray-400 text-center">散歩後に「アフター」を記録できます</p>
      )}

      <MoodHistory />
    </div>
  );
}
