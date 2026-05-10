"use client";

import { useState } from "react";
import { DailyRecord } from "@/lib/storage";
import ProgramOffer from "@/components/ProgramOffer";

interface SevenDayChallengeProps {
  records: DailyRecord[];
  compact?: boolean;
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
}

function getDayStatus(r: DailyRecord | undefined): "complete" | "recovery" | "walk" | "banana" | "none" {
  if (!r) return "none";
  if (r.completed) return "complete";
  if (r.recoveryCompleted) return "recovery";
  if (r.walked) return "walk";
  if (r.ateBanana) return "banana";
  return "none";
}

const STATUS_STYLES: Record<string, string> = {
  complete: "bg-amber-400 text-white font-bold",
  recovery: "bg-indigo-200 text-indigo-700",
  walk: "bg-green-100 text-green-600",
  banana: "bg-yellow-100 text-yellow-600",
  none: "bg-gray-100 text-gray-300",
};

const STATUS_ICON: Record<string, string> = {
  complete: "✓",
  recovery: "◎",
  walk: "🚶",
  banana: "🍌",
  none: "○",
};

export default function SevenDayChallenge({ records, compact = false }: SevenDayChallengeProps) {
  const [showOffer, setShowOffer] = useState(false);
  const days = getLast7Days();
  const recordMap = new Map(records.map((r) => [r.date, r]));
  const today = days[days.length - 1];

  const last7 = days.map((d) => recordMap.get(d));
  const walkDays = last7.filter((r) => r?.walked).length;
  const bananaDays = last7.filter((r) => r?.ateBanana).length;
  const completeDays = last7.filter((r) => r?.completed).length;
  const recoveryDays = last7.filter((r) => r?.recoveryCompleted && !r?.completed).length;
  const moodDays = last7.filter(
    (r) => r?.moodBefore !== undefined && r?.moodAfter !== undefined && r.moodAfter! > r.moodBefore!
  ).length;
  const actionDays = last7.filter((r) => r?.completed || r?.recoveryCompleted).length;

  const isAll7 = actionDays === 7;

  if (compact) {
    return (
      <div className="bg-white border border-amber-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-amber-700">7日チャレンジ</p>
          <span className="text-xs font-semibold text-amber-500">{actionDays}/7日</span>
        </div>
        <div className="flex gap-1.5 justify-between">
          {days.map((date, i) => {
            const r = recordMap.get(date);
            const status = getDayStatus(r);
            const isToday = i === 6;
            return (
              <div
                key={date}
                className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-xs font-bold ${STATUS_STYLES[status]} ${isToday ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}
              >
                {STATUS_ICON[status]}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          {days.map((date) => {
            const d = new Date(date + "T00:00:00");
            const wd = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
            return (
              <div key={date} className="flex-1 text-center">
                <span className="text-xs text-gray-400">{wd}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {showOffer && <ProgramOffer onClose={() => setShowOffer(false)} />}

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-amber-700">7日チャレンジ</h2>
        <p className="text-amber-400 text-sm mt-0.5">まずは7日。朝を少しだけ整える。</p>
      </div>

      {/* Day grid */}
      <div className="bg-white border border-amber-100 rounded-2xl p-4">
        <div className="flex gap-2 mb-2">
          {days.map((date, i) => {
            const r = recordMap.get(date);
            const status = getDayStatus(r);
            const isToday = date === today;
            const d = new Date(date + "T00:00:00");
            const wd = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">{wd}</span>
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm ${STATUS_STYLES[status]} ${isToday ? "ring-2 ring-amber-500 ring-offset-1" : ""}`}
                >
                  {STATUS_ICON[status]}
                </div>
                <span className="text-xs text-gray-300">{d.getDate()}</span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-3 border-t border-gray-50 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-amber-400 rounded text-center text-xs leading-4 text-white font-bold">✓</div>
            <span className="text-xs text-gray-500">完全達成</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-indigo-200 rounded text-center text-xs leading-4 text-indigo-700">◎</div>
            <span className="text-xs text-gray-500">リカバリー</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-100 rounded text-center text-xs leading-4">🚶</div>
            <span className="text-xs text-gray-500">散歩のみ</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs text-amber-500 font-medium">しっかり整えた日</p>
          <p className="text-3xl font-black text-amber-700">{completeDays}<span className="text-base font-normal text-amber-400">/7</span></p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <p className="text-xs text-indigo-500 font-medium">ゼロにしなかった日</p>
          <p className="text-3xl font-black text-indigo-700">{recoveryDays}<span className="text-base font-normal text-indigo-400">/7</span></p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-xs text-green-500 font-medium">散歩できた日</p>
          <p className="text-3xl font-black text-green-700">{walkDays}<span className="text-base font-normal text-green-400">/7</span></p>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
          <p className="text-xs text-teal-500 font-medium">気分が少し軽くなった日</p>
          <p className="text-3xl font-black text-teal-700">{moodDays}<span className="text-base font-normal text-teal-400">/7</span></p>
        </div>
      </div>

      {/* Encouragement */}
      {!isAll7 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          {actionDays === 0
            ? <p className="text-amber-600 text-sm">今日から7日間チャレンジを始めましょう！</p>
            : actionDays < 4
            ? <p className="text-amber-600 text-sm">いいスタートです。{7 - actionDays}日後が楽しみです。</p>
            : <p className="text-amber-600 text-sm">あと{7 - actionDays}日！この調子で続けましょう。</p>
          }
        </div>
      )}

      {/* 7-day celebration + CTA */}
      {isAll7 && (
        <div className="bg-gradient-to-br from-amber-100 to-yellow-50 border-2 border-amber-300 rounded-3xl p-6">
          <p className="text-center text-4xl mb-3">🎉</p>
          <p className="text-center text-xl font-black text-amber-700 mb-3">7日間おつかれさまでした！</p>
          <div className="bg-white rounded-2xl p-4 mb-4 text-sm text-gray-600 space-y-1">
            <p>この7日間で、</p>
            <p>・散歩 <span className="font-bold text-green-600">{walkDays}日</span></p>
            <p>・バナナ <span className="font-bold text-yellow-600">{bananaDays}日</span></p>
            <p>・完全達成 <span className="font-bold text-amber-600">{completeDays}日</span></p>
            <p>・リカバリー達成 <span className="font-bold text-indigo-600">{recoveryDays}日</span></p>
            <p>・気分が軽くなった日 <span className="font-bold text-teal-600">{moodDays}日</span></p>
            <p className="pt-1">を記録しました。</p>
          </div>
          <p className="text-center text-amber-600 text-sm mb-4">
            次は30日で、朝の土台を作っていきませんか？
          </p>
          <button
            onClick={() => setShowOffer(true)}
            className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black py-4 rounded-2xl active:scale-95 transition-all"
          >
            30日リセットプログラムを見る
          </button>
        </div>
      )}
    </div>
  );
}
