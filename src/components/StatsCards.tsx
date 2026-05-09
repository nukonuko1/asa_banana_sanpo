"use client";

import { Stats } from "@/lib/stats";

interface StatsCardsProps {
  stats: Stats;
}

interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const hours = Math.floor(stats.totalWalkMinutes / 60);
  const mins = stats.totalWalkMinutes % 60;
  const timeStr = hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;

  const items: StatItem[] = [
    { label: "現在の連続達成", value: stats.currentStreak, unit: "日", icon: "🔥", color: "bg-orange-50 border-orange-100" },
    { label: "最長連続達成", value: stats.longestStreak, unit: "日", icon: "🏆", color: "bg-yellow-50 border-yellow-100" },
    { label: "今月の完全達成", value: stats.monthlyComplete, unit: "日", icon: "📅", color: "bg-amber-50 border-amber-100" },
    { label: "今月の達成率", value: stats.monthlyRate, unit: "%", icon: "📊", color: "bg-lime-50 border-lime-100" },
    { label: "累計散歩回数", value: stats.totalWalks, unit: "回", icon: "🚶", color: "bg-green-50 border-green-100" },
    { label: "累計散歩時間", value: timeStr, icon: "⏱️", color: "bg-teal-50 border-teal-100" },
    { label: "バナナ達成回数", value: stats.bananaCount, unit: "回", icon: "🍌", color: "bg-yellow-50 border-yellow-100" },
    { label: "完全達成回数", value: stats.completeCount, unit: "回", icon: "🌟", color: "bg-amber-50 border-amber-100" },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">継続記録</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-2xl p-4 border ${item.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{item.icon}</span>
              <p className="text-xs text-gray-500 font-medium leading-tight">{item.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-700">
              {item.value}
              {item.unit && <span className="text-base font-normal text-gray-400 ml-0.5">{item.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {stats.completeCount === 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <p className="text-amber-600 text-sm">まだ記録がありません。</p>
          <p className="text-amber-500 text-sm mt-1">今日から始めましょう！</p>
        </div>
      )}
    </div>
  );
}
