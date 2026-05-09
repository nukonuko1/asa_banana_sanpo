"use client";

import { DailyRecord } from "@/lib/storage";

interface SevenDayChallengeProps {
  records: DailyRecord[];
  compact?: boolean;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }
  return days;
}

function getDayIcon(record: DailyRecord | undefined): string {
  if (!record) return "○";
  if (record.completed) return "✓";
  if (record.walked) return "🚶";
  if (record.ateBanana) return "🍌";
  return "○";
}

function getDayColor(record: DailyRecord | undefined): string {
  if (!record) return "bg-gray-100 text-gray-300";
  if (record.completed) return "bg-amber-400 text-white";
  if (record.walked) return "bg-green-100 text-green-600";
  if (record.ateBanana) return "bg-yellow-100 text-yellow-600";
  return "bg-gray-100 text-gray-400";
}

export default function SevenDayChallenge({ records, compact = false }: SevenDayChallengeProps) {
  const days = getLast7Days();
  const recordMap = new Map(records.map((r) => [r.date, r]));

  const last7Records = days.map((d) => recordMap.get(d));

  const walkDays = last7Records.filter((r) => r?.walked).length;
  const bananaDays = last7Records.filter((r) => r?.ateBanana).length;
  const completeDays = last7Records.filter((r) => r?.completed).length;
  const improvedMoodDays = last7Records.filter(
    (r) => r?.moodBefore !== undefined && r?.moodAfter !== undefined && r.moodAfter > r.moodBefore
  ).length;

  const today = days[days.length - 1];
  const todayRecord = recordMap.get(today);
  const todayIdx = 6;
  const isDay7 = completeDays === 7;

  if (compact) {
    return (
      <div className="bg-white border border-amber-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-amber-700">7日チャレンジ</p>
          <span className="text-xs text-amber-500 font-semibold">{completeDays}/7日完全達成</span>
        </div>
        <div className="flex gap-1.5 justify-between">
          {days.map((date, i) => {
            const rec = recordMap.get(date);
            const isToday = i === todayIdx;
            return (
              <div
                key={date}
                className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-xs font-bold ${getDayColor(rec)} ${isToday ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}
              >
                {getDayIcon(rec)}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          {days.map((date, i) => {
            const d = new Date(date + "T00:00:00");
            const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
            return (
              <div key={date} className="flex-1 text-center">
                <span className="text-xs text-gray-400">{weekdays[d.getDay()]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">7日チャレンジ</h2>

      {/* Day grid */}
      <div className="bg-white border border-amber-100 rounded-2xl p-4">
        <div className="flex gap-2 mb-2">
          {days.map((date, i) => {
            const rec = recordMap.get(date);
            const isToday = i === todayIdx;
            const d = new Date(date + "T00:00:00");
            const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">{weekdays[d.getDay()]}</span>
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-bold ${getDayColor(rec)} ${isToday ? "ring-2 ring-amber-500 ring-offset-1" : ""}`}
                >
                  {getDayIcon(rec)}
                </div>
                <span className="text-xs text-gray-300">{d.getDate()}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-amber-400 rounded-md" />
            <span className="text-xs text-gray-500">両方達成</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-100 rounded-md text-center text-xs leading-4">🚶</div>
            <span className="text-xs text-gray-500">散歩のみ</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-100 rounded-md text-center text-xs leading-4">🍌</div>
            <span className="text-xs text-gray-500">バナナのみ</span>
          </div>
        </div>
      </div>

      {/* 7-day stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-xs text-green-600 font-medium">散歩できた日</p>
          <p className="text-3xl font-black text-green-700 mt-1">{walkDays}<span className="text-base font-normal text-green-400">/7日</span></p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
          <p className="text-xs text-yellow-600 font-medium">バナナ達成日</p>
          <p className="text-3xl font-black text-yellow-700 mt-1">{bananaDays}<span className="text-base font-normal text-yellow-400">/7日</span></p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs text-amber-600 font-medium">完全達成日</p>
          <p className="text-3xl font-black text-amber-700 mt-1">{completeDays}<span className="text-base font-normal text-amber-400">/7日</span></p>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
          <p className="text-xs text-teal-600 font-medium">気分が軽くなった日</p>
          <p className="text-3xl font-black text-teal-700 mt-1">{improvedMoodDays}<span className="text-base font-normal text-teal-400">/7日</span></p>
        </div>
      </div>

      {/* Day 7 celebration */}
      {isDay7 && (
        <div className="bg-gradient-to-br from-amber-100 to-yellow-50 border-2 border-amber-300 rounded-3xl p-6 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-xl font-black text-amber-700">7日間おつかれさまでした！</p>
          <p className="text-amber-600 text-sm mt-2 leading-relaxed">
            次は30日で、朝の土台を作っていきませんか？
            <br />小さな習慣が、確実に積み上がっています。
          </p>
        </div>
      )}

      {/* Encouragement based on progress */}
      {!isDay7 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          {completeDays === 0 ? (
            <p className="text-amber-600 text-sm">今日から7日間チャレンジを始めましょう！</p>
          ) : completeDays < 3 ? (
            <p className="text-amber-600 text-sm">いいスタートです。{7 - completeDays}日後が楽しみです。</p>
          ) : completeDays < 6 ? (
            <p className="text-amber-600 text-sm">順調に積み上がっています。あと{7 - completeDays}日！</p>
          ) : (
            <p className="text-amber-600 text-sm">あと1日！7日達成まであと少しです。</p>
          )}
        </div>
      )}
    </div>
  );
}
