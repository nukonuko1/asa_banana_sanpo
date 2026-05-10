"use client";

import { Stats } from "@/lib/stats";

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const hours = Math.floor(stats.totalWalkMinutes / 60);
  const mins = stats.totalWalkMinutes % 60;
  const timeStr = hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">継続記録</h2>

      {/* Streak section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wide">連続記録</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">🔥</span>
              <p className="text-xs text-orange-500 font-medium">現在の連続完全達成</p>
            </div>
            <p className="text-3xl font-black text-orange-600">{stats.currentStreak}<span className="text-base font-normal text-orange-400">日</span></p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">💜</span>
              <p className="text-xs text-indigo-500 font-medium">続けた日数</p>
            </div>
            <p className="text-3xl font-black text-indigo-600">{stats.currentActionStreak}<span className="text-base font-normal text-indigo-400">日</span></p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">🏆</span>
              <p className="text-xs text-yellow-600 font-medium">最長連続完全達成</p>
            </div>
            <p className="text-3xl font-black text-yellow-600">{stats.longestStreak}<span className="text-base font-normal text-yellow-400">日</span></p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">📆</span>
              <p className="text-xs text-amber-600 font-medium">7日チャレンジ進捗</p>
            </div>
            <p className="text-3xl font-black text-amber-600">{stats.sevenDayProgress}<span className="text-base font-normal text-amber-400">/7</span></p>
          </div>
        </div>
      </div>

      {/* Monthly section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wide">今月の達成</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-amber-500 font-medium">しっかり整えた日</p>
            <p className="text-2xl font-black text-amber-700 mt-1">{stats.monthlyComplete}<span className="text-sm font-normal text-amber-400">日</span></p>
            <p className="text-xs text-gray-400 mt-0.5">完全達成</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-xs text-indigo-500 font-medium">ゼロにしなかった日</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">{stats.monthlyRecovery}<span className="text-sm font-normal text-indigo-400">日</span></p>
            <p className="text-xs text-gray-400 mt-0.5">リカバリー達成</p>
          </div>
        </div>
      </div>

      {/* Lifetime section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wide">累計記録</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">🚶</span>
              <p className="text-xs text-green-500 font-medium">累計散歩回数</p>
            </div>
            <p className="text-2xl font-black text-green-700">{stats.totalWalks}<span className="text-base font-normal text-green-400">回</span></p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">⏱️</span>
              <p className="text-xs text-teal-500 font-medium">累計散歩時間</p>
            </div>
            <p className="text-xl font-black text-teal-700">{timeStr}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">🍌</span>
              <p className="text-xs text-yellow-600 font-medium">バナナ達成回数</p>
            </div>
            <p className="text-2xl font-black text-yellow-700">{stats.bananaCount}<span className="text-base font-normal text-yellow-400">回</span></p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">🌿</span>
              <p className="text-xs text-teal-600 font-medium">気分が軽くなった日</p>
            </div>
            <p className="text-2xl font-black text-teal-700">{stats.moodImprovedDays}<span className="text-base font-normal text-teal-400">日</span></p>
          </div>
        </div>
      </div>

      {stats.completeCount === 0 && stats.recoveryCount === 0 && (
        <div className="text-center py-4 text-gray-400">
          <p className="text-sm">まだ記録がありません。今日から始めましょう！</p>
        </div>
      )}
    </div>
  );
}
