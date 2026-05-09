"use client";

import { useState } from "react";
import { getTodayRecord, saveRecord, getYesterdaysNightPrep } from "@/lib/storage";
import HeavyMorningMode from "@/components/HeavyMorningMode";
import { Tab } from "@/components/Navigation";

interface MorningSwitchProps {
  onComplete: (tab: Tab) => void;
  onSkip: () => void;
}

type WeightOption = "heavy" | "normal" | "light";
type ActionOption = "walk20" | "walk5" | "bananaOnly";

const weightOptions: { id: WeightOption; label: string; emoji: string; desc: string }[] = [
  { id: "heavy", label: "重い", emoji: "😫", desc: "体も頭も動きたくない" },
  { id: "normal", label: "ふつう", emoji: "😐", desc: "まあまあ" },
  { id: "light", label: "軽い", emoji: "🙂", desc: "わりと調子いい" },
];

const actionOptions: { id: ActionOption; label: string; emoji: string; desc: string }[] = [
  { id: "walk20", label: "20分歩く", emoji: "🚶", desc: "今日の土台をしっかり作る" },
  { id: "walk5", label: "5分だけ外に出る", emoji: "🌤️", desc: "玄関まで行ければ勝ち" },
  { id: "bananaOnly", label: "バナナだけ食べる", emoji: "🍌", desc: "今日はこれで十分" },
];

export default function MorningSwitch({ onComplete, onSkip }: MorningSwitchProps) {
  const [weight, setWeight] = useState<WeightOption | null>(null);
  const [action, setAction] = useState<ActionOption | null>(null);
  const [showHeavy, setShowHeavy] = useState(false);

  const yesterdaysPrep = getYesterdaysNightPrep();

  const handleWeightSelect = (w: WeightOption) => {
    setWeight(w);
    if (w === "heavy") {
      setAction(null);
    }
  };

  const handleStart = () => {
    if (!weight) return;

    const record = getTodayRecord();
    saveRecord({
      ...record,
      morningWeight: weight,
      selectedMinimumAction: action ?? undefined,
    });

    if (weight === "heavy" && !showHeavy) {
      setShowHeavy(true);
      return;
    }

    const tab: Tab =
      action === "bananaOnly" ? "record" : "timer";
    onComplete(tab);
  };

  const handleHeavyDone = () => {
    const record = getTodayRecord();
    saveRecord({
      ...record,
      morningWeight: "heavy",
      selectedMinimumAction: "walk5",
    });
    onComplete("record");
  };

  return (
    <div className="fixed inset-0 bg-amber-50 z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">

        {/* Header */}
        <div className="text-center pt-4">
          <p className="text-4xl mb-3">🌅</p>
          <h1 className="text-2xl font-black text-amber-700 leading-snug">
            おはよう。<br />今日の朝を、少しだけ整えよう。
          </h1>
          <p className="text-amber-500 text-sm mt-2">
            完璧じゃなくていい。まずは体を起こすところから。
          </p>
        </div>

        {/* Yesterday's message */}
        {yesterdaysPrep?.messageToTomorrowSelf && (
          <div className="bg-white border border-amber-200 rounded-2xl p-4">
            <p className="text-xs text-amber-400 font-semibold mb-1">💌 昨日の自分からのメッセージ</p>
            <p className="text-amber-700 font-medium text-sm leading-relaxed">
              「{yesterdaysPrep.messageToTomorrowSelf}」
            </p>
          </div>
        )}

        {!showHeavy ? (
          <>
            {/* Morning weight */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-3">今の朝の重さは？</p>
              <div className="flex gap-2">
                {weightOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleWeightSelect(opt.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl border-2 transition-all active:scale-95 ${
                      weight === opt.id
                        ? "bg-amber-100 border-amber-400"
                        : "bg-white border-gray-100 hover:border-amber-200"
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className={`text-sm font-bold ${weight === opt.id ? "text-amber-700" : "text-gray-600"}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-400 text-center leading-tight px-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum action — only if not heavy */}
            {weight && weight !== "heavy" && (
              <div>
                <p className="text-sm font-bold text-gray-600 mb-3">今日の合格ラインは？</p>
                <div className="flex flex-col gap-2">
                  {actionOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAction(opt.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all active:scale-95 ${
                        action === opt.id
                          ? "bg-amber-100 border-amber-400"
                          : "bg-white border-gray-100 hover:border-amber-200"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <div className="text-left flex-1">
                        <p className={`text-sm font-bold ${action === opt.id ? "text-amber-700" : "text-gray-700"}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                        action === opt.id ? "bg-amber-400 border-amber-400" : "border-gray-200"
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Heavy morning shortcut */}
            {weight === "heavy" && (
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
                <p className="text-purple-600 text-sm font-semibold">
                  今日は特別モードで、小さな一歩を一緒に探しましょう。
                </p>
              </div>
            )}

            {/* Start button */}
            {weight && (weight === "heavy" || action) && (
              <button
                onClick={handleStart}
                className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black py-5 rounded-3xl text-xl shadow-md active:scale-95 transition-all"
              >
                {weight === "heavy" ? "💜 重い日モードへ" : "✨ 今日を始める"}
              </button>
            )}
          </>
        ) : (
          <HeavyMorningMode onActionDone={handleHeavyDone} onSkip={() => onComplete("home")} />
        )}

        {/* Skip */}
        {!showHeavy && (
          <button onClick={onSkip} className="text-center text-gray-400 text-xs py-2">
            スキップして普通に開く
          </button>
        )}
      </div>
    </div>
  );
}
