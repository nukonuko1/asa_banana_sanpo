"use client";

import { useState } from "react";
import { getTodayRecord, saveRecord, MinimumAction } from "@/lib/storage";

interface HeavyMorningModeProps {
  onComplete: () => void;
  onSkip: () => void;
}

const microActions: { id: MinimumAction; emoji: string; label: string; detail: string }[] = [
  { id: "curtain", emoji: "🪟", label: "カーテンを開ける", detail: "光を少し入れるだけでOK" },
  { id: "window1", emoji: "🌤️", label: "窓際で1分立つ", detail: "外の光を目に入れるだけ" },
  { id: "bananaBite", emoji: "🍌", label: "バナナを一口食べる", detail: "全部食べなくてもOK" },
  { id: "entrance", emoji: "🚪", label: "玄関まで行く", detail: "ドアを開けなくてもOK" },
  { id: "walk5", emoji: "🚶", label: "5分だけ歩く", detail: "コンビニまででも十分" },
];

export default function HeavyMorningMode({ onComplete, onSkip }: HeavyMorningModeProps) {
  const [selected, setSelected] = useState<MinimumAction | null>(null);
  const [done, setDone] = useState(false);

  const handleSelect = (id: MinimumAction) => setSelected(id);

  const handleConfirm = () => {
    if (!selected) return;
    const record = getTodayRecord();
    const isWalk = selected === "walk5";
    const isBanana = selected === "bananaBite";
    saveRecord({
      ...record,
      selectedMinimumAction: selected,
      recoveryCompleted: true,
      walked: isWalk || record.walked,
      walkMinutes: isWalk ? 5 : record.walkMinutes,
      ateBanana: isBanana || record.ateBanana,
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">💜</p>
          <p className="text-purple-700 font-bold text-base">
            {selected === "walk5" ? "5分歩けました。" : "一つできました。"}
          </p>
          <p className="text-purple-600 text-sm mt-2 leading-relaxed">
            ゼロにしなかったことが、次につながります。<br />
            重い朝でも、ひとつ行動できました。
          </p>
          <div className="mt-3 bg-white rounded-xl px-3 py-1.5 inline-block">
            <span className="text-xs text-indigo-500 font-semibold">🔄 リカバリー達成</span>
          </div>
        </div>
        <button
          onClick={onComplete}
          className="w-full bg-purple-400 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all"
        >
          今日はこれで十分です
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
        <p className="text-purple-700 font-bold mb-1">💜 今日は重い朝です</p>
        <p className="text-purple-600 text-sm leading-relaxed">
          20分歩けなくても大丈夫。習慣の火を消さないことが大切です。
          今日できる最小の一歩を選びましょう。
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {microActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleSelect(action.id)}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 ${
              selected === action.id
                ? "bg-purple-100 border-purple-300"
                : "bg-white border-gray-100 hover:border-purple-200"
            }`}
          >
            <span className="text-2xl">{action.emoji}</span>
            <div className="flex-1 text-left">
              <p className={`font-semibold text-sm ${selected === action.id ? "text-purple-700" : "text-gray-700"}`}>
                {action.label}
              </p>
              <p className="text-xs text-gray-400">{action.detail}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              selected === action.id ? "bg-purple-400 border-purple-400" : "border-gray-200"
            }`}>
              {selected === action.id && <span className="text-white text-xs">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <button
          onClick={handleConfirm}
          className="w-full bg-purple-400 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all"
        >
          これをやってみる
        </button>
      )}

      <button onClick={onSkip} className="text-center text-gray-400 text-xs py-2">
        今日は休む（それも大事な選択）
      </button>
    </div>
  );
}
