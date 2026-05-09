"use client";

import { useState } from "react";
import { DailyRecord, getTodayRecord, saveRecord } from "@/lib/storage";

interface TodayCheckProps {
  record: DailyRecord;
  onUpdate: () => void;
}

const rainyAlternatives = [
  "玄関先で朝の外気を感じる",
  "窓際で3分立って外の光を浴びる",
  "室内で軽く足踏みする",
  "ベランダに出て深呼吸する",
  "バナナだけ食べる",
  "「今日も続ける意思」を日記に記録する",
];

const lateAlternatives = [
  "5分だけ近所を歩く",
  "昼休みに少し歩く",
  "バナナだけ食べる",
  "明日の朝に仕切り直す",
  "日記だけ書く",
];

export default function TodayCheck({ record, onUpdate }: TodayCheckProps) {
  const [showRainy, setShowRainy] = useState(false);
  const [showLate, setShowLate] = useState(false);

  const handleBanana = () => {
    const current = getTodayRecord();
    saveRecord({ ...current, ateBanana: true });
    onUpdate();
  };

  const bothComplete = record.walked && record.ateBanana;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">今日の達成チェック</h2>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl p-4 flex flex-col items-center gap-2 border ${record.walked ? "bg-green-50 border-green-200" : "bg-white border-amber-100"}`}>
          <span className="text-4xl">{record.walked ? "✅" : "🚶"}</span>
          <p className="font-semibold text-sm text-center">朝散歩</p>
          <p className={`text-xs font-medium ${record.walked ? "text-green-600" : "text-gray-400"}`}>
            {record.walked ? `${record.walkMinutes}分 達成！` : "今日はまだ"}
          </p>
        </div>
        <div className={`rounded-2xl p-4 flex flex-col items-center gap-2 border ${record.ateBanana ? "bg-yellow-50 border-yellow-200" : "bg-white border-amber-100"}`}>
          <span className="text-4xl">{record.ateBanana ? "✅" : "🍌"}</span>
          <p className="font-semibold text-sm text-center">バナナ</p>
          <p className={`text-xs font-medium ${record.ateBanana ? "text-yellow-600" : "text-gray-400"}`}>
            {record.ateBanana ? "達成！" : "今日はまだ"}
          </p>
        </div>
      </div>

      {/* Complete message */}
      {bothComplete && (
        <div className="bg-gradient-to-r from-amber-50 to-green-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">🌟</p>
          <p className="text-amber-700 font-bold">今日の朝リズム、完成です。</p>
          <p className="text-amber-600 text-sm mt-1">小さな一歩が積み上がっています。</p>
        </div>
      )}

      {/* Banana button */}
      {!record.ateBanana && (
        <button
          onClick={handleBanana}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 rounded-2xl text-lg shadow-sm active:scale-95 transition-all"
        >
          🍌 バナナを食べた！
        </button>
      )}

      {/* Rainy day mode */}
      <div className="rounded-2xl border border-sky-100 overflow-hidden">
        <button
          onClick={() => setShowRainy((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 bg-sky-50 hover:bg-sky-100 transition-colors"
        >
          <span className="flex items-center gap-2 text-sky-700 font-semibold">
            🌧️ 雨の日・外に出られない日
          </span>
          <span className="text-sky-400">{showRainy ? "▲" : "▼"}</span>
        </button>
        {showRainy && (
          <div className="px-4 pb-4 bg-sky-50">
            <p className="text-sky-600 text-sm mb-3">
              完璧な朝散歩じゃなくても大丈夫。習慣の火を消さないことが大切です。
            </p>
            <ul className="flex flex-col gap-2">
              {rainyAlternatives.map((alt, i) => (
                <li key={i} className="flex items-start gap-2 text-sky-700 text-sm bg-white rounded-xl px-3 py-2 border border-sky-100">
                  <span>✦</span> {alt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Late wakeup mode */}
      <div className="rounded-2xl border border-purple-100 overflow-hidden">
        <button
          onClick={() => setShowLate((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 transition-colors"
        >
          <span className="flex items-center gap-2 text-purple-700 font-semibold">
            😴 寝坊した日
          </span>
          <span className="text-purple-400">{showLate ? "▲" : "▼"}</span>
        </button>
        {showLate && (
          <div className="px-4 pb-4 bg-purple-50">
            <p className="text-purple-600 text-sm mb-3">
              寝坊しても失敗ではありません。今日できる最小の一歩を選びましょう。
            </p>
            <ul className="flex flex-col gap-2">
              {lateAlternatives.map((alt, i) => (
                <li key={i} className="flex items-start gap-2 text-purple-700 text-sm bg-white rounded-xl px-3 py-2 border border-purple-100">
                  <span>✦</span> {alt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
