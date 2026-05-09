"use client";

interface GrowthPlantProps {
  completeCount: number;
  compact?: boolean;
}

interface PlantStage {
  minDays: number;
  emoji: string;
  name: string;
  message: string;
}

const stages: PlantStage[] = [
  { minDays: 60, emoji: "🌲", name: "朝の森", message: "朝の森が育っています" },
  { minDays: 30, emoji: "🌳", name: "朝の木", message: "大きな木になりました" },
  { minDays: 21, emoji: "🌼", name: "花", message: "花が咲きました" },
  { minDays: 14, emoji: "🪴", name: "大きな植物", message: "しっかり育っています" },
  { minDays: 7, emoji: "🍃", name: "葉っぱ", message: "葉っぱが増えました" },
  { minDays: 3, emoji: "🌱", name: "芽", message: "芽が出ました" },
  { minDays: 1, emoji: "🌰", name: "種", message: "種をまきました" },
  { minDays: 0, emoji: "🌍", name: "土", message: "土の準備ができています" },
];

function getStage(days: number): PlantStage {
  return stages.find((s) => days >= s.minDays) ?? stages[stages.length - 1];
}

function getNextStage(days: number): PlantStage | null {
  const thresholds = [1, 3, 7, 14, 21, 30, 60];
  const next = thresholds.find((t) => t > days);
  if (!next) return null;
  return getStage(next);
}

export default function GrowthPlant({ completeCount, compact = false }: GrowthPlantProps) {
  const stage = getStage(completeCount);
  const nextStage = getNextStage(completeCount);

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
        <span className="text-4xl">{stage.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-green-700">{stage.message}</p>
          <p className="text-xs text-green-500">完全達成 {completeCount}日</p>
        </div>
      </div>
    );
  }

  const thresholds = [0, 1, 3, 7, 14, 21, 30, 60];
  const currentThreshold = thresholds.findLast((t) => t <= completeCount) ?? 0;
  const nextThreshold = thresholds.find((t) => t > completeCount);
  const progressPct = nextThreshold
    ? Math.round(((completeCount - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 100;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">植物育成</h2>

      {/* Main plant display */}
      <div className="bg-gradient-to-b from-sky-50 to-green-50 border border-green-100 rounded-3xl p-8 flex flex-col items-center gap-3">
        <span className="text-8xl drop-shadow-sm">{stage.emoji}</span>
        <p className="text-xl font-bold text-green-700">{stage.name}</p>
        <p className="text-green-600 text-center text-sm">{stage.message}</p>
        <div className="bg-amber-50 border border-amber-100 rounded-full px-4 py-1">
          <span className="text-amber-600 text-sm font-semibold">完全達成 {completeCount}日</span>
        </div>
      </div>

      {/* Progress to next stage */}
      {nextStage && nextThreshold && (
        <div className="bg-white border border-green-100 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">次のステージまで</span>
            <span className="text-sm font-semibold text-green-600">
              {nextThreshold - completeCount}日
            </span>
          </div>
          <div className="h-3 bg-green-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">{stage.emoji} {stage.name}</span>
            <span className="text-xs text-gray-400">{nextStage.emoji} {nextStage.name}</span>
          </div>
        </div>
      )}

      {/* Growth stages overview */}
      <div className="bg-white border border-amber-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-amber-700 mb-3">成長の記録</p>
        <div className="flex flex-col gap-2">
          {stages.slice().reverse().map((s) => (
            <div
              key={s.minDays}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl ${completeCount >= s.minDays ? "bg-green-50" : "bg-gray-50 opacity-50"}`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${completeCount >= s.minDays ? "text-green-700" : "text-gray-400"}`}>{s.name}</p>
                <p className="text-xs text-gray-400">{s.minDays}日から</p>
              </div>
              {completeCount >= s.minDays && <span className="text-green-400 text-sm">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
