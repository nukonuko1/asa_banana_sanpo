"use client";

import { useState } from "react";

interface HeavyMorningModeProps {
  onActionDone: () => void;
  onSkip: () => void;
}

const microActions = [
  { id: "curtain", emoji: "🪟", label: "カーテンを開ける", detail: "光を少し入れるだけでOK" },
  { id: "window", emoji: "🌤️", label: "窓際で1分立つ", detail: "外の光を目に入れるだけ" },
  { id: "banana", emoji: "🍌", label: "バナナを一口食べる", detail: "全部食べなくても大丈夫" },
  { id: "entrance", emoji: "🚪", label: "玄関まで行く", detail: "ドアを開けなくてもOK" },
  { id: "walk5", emoji: "🚶", label: "5分だけ歩く", detail: "コンビニまででも十分" },
];

export default function HeavyMorningMode({ onActionDone, onSkip }: HeavyMorningModeProps) {
  const [done, setDone] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
        <p className="text-purple-700 text-sm font-semibold mb-1">💜 今日は無理しなくていい</p>
        <p className="text-purple-600 text-sm leading-relaxed">
          20分歩けなくても大丈夫。習慣の火を消さないことが大切です。
          できそうなことを1つだけ選んでみてください。
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {microActions.map((action) => {
          const checked = done.has(action.id);
          return (
            <button
              key={action.id}
              onClick={() => toggle(action.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-95 ${
                checked
                  ? "bg-purple-100 border-purple-300"
                  : "bg-white border-gray-100 hover:border-purple-200"
              }`}
            >
              <span className="text-2xl">{action.emoji}</span>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${checked ? "text-purple-700" : "text-gray-700"}`}>
                  {action.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{action.detail}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                checked ? "bg-purple-400 border-purple-400" : "border-gray-200"
              }`}>
                {checked && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {done.size > 0 && (
        <button
          onClick={onActionDone}
          className="w-full bg-purple-400 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-all"
        >
          {done.size}つできた！今日はこれで十分
        </button>
      )}

      <button
        onClick={onSkip}
        className="w-full text-gray-400 text-sm py-2"
      >
        今日は休む（それも大事な選択）
      </button>
    </div>
  );
}
