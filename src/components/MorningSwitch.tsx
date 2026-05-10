"use client";

import { useState, useEffect } from "react";
import { DailyRecord, getTodayRecord, saveRecord, getYesterdaysNightPrep } from "@/lib/storage";
import { Stats } from "@/lib/stats";
import { Tab } from "@/components/Navigation";
import HeavyMorningMode from "@/components/HeavyMorningMode";
import RecoveryActionCard from "@/components/RecoveryActionCard";
import { getTodaysCard } from "@/data/knowledgeCards";

interface MorningSwitchProps {
  todayRecord: DailyRecord;
  stats: Stats;
  onNavigate: (tab: Tab) => void;
  onUpdate: () => void;
}

type Phase = "welcome" | "action" | "heavy" | "status";

type Weight = "heavy" | "normal" | "light";
type ActionChoice = "walk20" | "walk5" | "bananaOnly";

const weightOptions: { id: Weight; emoji: string; label: string; desc: string }[] = [
  { id: "heavy", emoji: "😫", label: "重い", desc: "体も頭も動きたくない" },
  { id: "normal", emoji: "😐", label: "ふつう", desc: "まあまあ" },
  { id: "light", emoji: "🙂", label: "軽い", desc: "わりと調子いい" },
];

const actionOptions: { id: ActionChoice; emoji: string; label: string; desc: string }[] = [
  { id: "walk20", emoji: "🚶", label: "20分歩く", desc: "今日の土台をしっかり作る" },
  { id: "walk5", emoji: "🌤️", label: "5分だけ外に出る", desc: "玄関まで行ければ勝ち" },
  { id: "bananaOnly", emoji: "🍌", label: "バナナだけ食べる", desc: "今日はこれで十分" },
];

function formatDate(date: Date): string {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
}

export default function MorningSwitch({ todayRecord, stats, onNavigate, onUpdate }: MorningSwitchProps) {
  const [phase, setPhase] = useState<Phase>(() => {
    if (!todayRecord.morningWeight) return "welcome";
    if (todayRecord.morningWeight === "heavy") return "heavy";
    if (!todayRecord.selectedMinimumAction) return "action";
    return "status";
  });
  const [selectedWeight, setSelectedWeight] = useState<Weight | null>(
    todayRecord.morningWeight ?? null
  );
  const [selectedAction, setSelectedAction] = useState<ActionChoice | null>(
    (todayRecord.selectedMinimumAction as ActionChoice) ?? null
  );

  const yesterdaysPrep = getYesterdaysNightPrep();
  const todayCard = getTodaysCard();
  const today = new Date();

  useEffect(() => {
    if (!todayRecord.morningWeight) {
      setPhase("welcome");
    } else if (todayRecord.morningWeight === "heavy" && phase !== "status") {
      setPhase("heavy");
    } else if (!todayRecord.selectedMinimumAction && phase === "welcome") {
      setPhase("action");
    } else if (todayRecord.selectedMinimumAction) {
      setPhase("status");
    }
  }, [todayRecord]);

  const handleWeightSelect = (w: Weight) => {
    setSelectedWeight(w);
    const record = getTodayRecord();
    saveRecord({ ...record, morningWeight: w });
    onUpdate();
    if (w === "heavy") {
      setPhase("heavy");
    } else {
      setPhase("action");
    }
  };

  const handleActionSelect = (a: ActionChoice) => {
    setSelectedAction(a);
    const record = getTodayRecord();
    saveRecord({ ...record, selectedMinimumAction: a });
    onUpdate();

    if (a === "walk20") {
      onNavigate("timer");
    } else if (a === "walk5") {
      onNavigate("timer");
    } else {
      setPhase("status");
    }
  };

  const handleHeavyComplete = () => {
    onUpdate();
    setPhase("status");
  };

  const bothComplete = todayRecord.walked && todayRecord.ateBanana;
  const anyAction =
    bothComplete || todayRecord.recoveryCompleted;

  // ── Status screen (already set today) ───────────────────────────────────
  if (phase === "status") {
    return (
      <div className="flex flex-col gap-4 px-4 pt-5 pb-4">
        <div className="text-center">
          <p className="text-3xl mb-1">🌅</p>
          <p className="text-amber-400 text-xs font-medium">{formatDate(today)}</p>
        </div>

        {/* Completion status */}
        {bothComplete && (
          <div className="bg-gradient-to-br from-amber-50 to-green-50 border-2 border-amber-300 rounded-3xl p-5 text-center">
            <p className="text-3xl mb-1">🌟</p>
            <p className="text-amber-700 font-black text-lg">今日の朝リズム、完成です！</p>
            <p className="text-amber-500 text-sm mt-1">小さな一歩が積み上がっています。</p>
          </div>
        )}
        {!bothComplete && todayRecord.recoveryCompleted && (
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-5 text-center">
            <p className="text-3xl mb-1">💜</p>
            <p className="text-indigo-700 font-bold">ゼロにしなかった日です。</p>
            <p className="text-indigo-500 text-sm mt-1">それで十分。次につながります。</p>
          </div>
        )}
        {!bothComplete && !todayRecord.recoveryCompleted && (
          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 text-center">
            <p className="text-amber-600 font-bold">今日はまだ途中です。</p>
            <p className="text-amber-400 text-sm mt-1">できるところから始めましょう。</p>
          </div>
        )}

        {/* Streak */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-orange-500">{stats.currentStreak}</p>
            <p className="text-xs text-orange-400">🔥 連続完全達成</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-indigo-500">{stats.currentActionStreak}</p>
            <p className="text-xs text-indigo-400">💜 続けた日数</p>
          </div>
        </div>

        {/* Today's actions */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-2xl py-3 px-4 flex items-center gap-2 ${todayRecord.walked ? "bg-green-100" : "bg-gray-50"}`}>
            <span className="text-xl">{todayRecord.walked ? "✅" : "🚶"}</span>
            <div>
              <p className="text-xs text-gray-500">散歩</p>
              <p className={`text-sm font-bold ${todayRecord.walked ? "text-green-600" : "text-gray-400"}`}>
                {todayRecord.walked ? `${todayRecord.walkMinutes}分` : "今日はまだ"}
              </p>
            </div>
          </div>
          <div className={`rounded-2xl py-3 px-4 flex items-center gap-2 ${todayRecord.ateBanana ? "bg-yellow-100" : "bg-gray-50"}`}>
            <span className="text-xl">{todayRecord.ateBanana ? "✅" : "🍌"}</span>
            <div>
              <p className="text-xs text-gray-500">バナナ</p>
              <p className={`text-sm font-bold ${todayRecord.ateBanana ? "text-yellow-600" : "text-gray-400"}`}>
                {todayRecord.ateBanana ? "食べた！" : "今日はまだ"}
              </p>
            </div>
          </div>
        </div>

        {/* Next actions */}
        {!todayRecord.walked && selectedAction !== "bananaOnly" && (
          <button
            onClick={() => onNavigate("timer")}
            className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black py-4 rounded-2xl text-lg active:scale-95 transition-all"
          >
            🚶 タイマーを始める
          </button>
        )}

        {/* Banana only if selected */}
        {(selectedAction === "bananaOnly" || todayRecord.recoveryCompleted) && (
          <RecoveryActionCard isBananaEaten={todayRecord.ateBanana} onUpdate={onUpdate} />
        )}

        {!todayRecord.ateBanana && selectedAction !== "bananaOnly" && (
          <button
            onClick={() => {
              const record = getTodayRecord();
              saveRecord({ ...record, ateBanana: true });
              onUpdate();
            }}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all"
          >
            🍌 バナナを食べた
          </button>
        )}

        {/* Knowledge card compact */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{todayCard.icon}</span>
            <p className="text-xs font-semibold text-amber-500">今日の雑学</p>
          </div>
          <p className="text-sm font-bold text-amber-700 mb-1">{todayCard.title}</p>
          <p className="text-xs text-amber-600 leading-relaxed">{todayCard.body}</p>
        </div>
      </div>
    );
  }

  // ── Heavy mode ───────────────────────────────────────────────────────────
  if (phase === "heavy") {
    return (
      <div className="flex flex-col gap-4 px-4 pt-5 pb-4">
        <div className="text-center">
          <p className="text-3xl mb-1">🌅</p>
          <h2 className="text-xl font-black text-gray-700">今日は重い朝です。</h2>
          <p className="text-gray-400 text-xs mt-1">{formatDate(today)}</p>
        </div>
        <HeavyMorningMode onComplete={handleHeavyComplete} onSkip={handleHeavyComplete} />
      </div>
    );
  }

  // ── Action selection ─────────────────────────────────────────────────────
  if (phase === "action") {
    return (
      <div className="flex flex-col gap-5 px-4 pt-5 pb-4">
        <div className="text-center">
          <p className="text-3xl mb-1">🌅</p>
          <h2 className="text-xl font-black text-amber-700 leading-snug">
            今日の合格ラインを選ぼう。
          </h2>
          <p className="text-amber-400 text-xs mt-1">
            完璧じゃなくていい。これをやれば今日はOK。
          </p>
        </div>

        {yesterdaysPrep?.messageToTomorrowSelf && (
          <div className="bg-white border border-amber-200 rounded-2xl p-4">
            <p className="text-xs text-amber-400 font-semibold mb-1">💌 昨日の自分から</p>
            <p className="text-amber-700 font-medium text-sm leading-relaxed">
              「{yesterdaysPrep.messageToTomorrowSelf}」
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {actionOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleActionSelect(opt.id)}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-amber-100 bg-white hover:border-amber-300 hover:bg-amber-50 active:scale-95 transition-all"
            >
              <span className="text-4xl">{opt.emoji}</span>
              <div className="flex-1 text-left">
                <p className="text-base font-bold text-gray-700">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
              </div>
              <span className="text-amber-300 text-xl">›</span>
            </button>
          ))}
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-orange-500">{stats.currentStreak}</p>
            <p className="text-xs text-orange-400">🔥 連続完全達成</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-amber-500">{stats.sevenDayProgress}</p>
            <p className="text-xs text-amber-400">📆 7日中の達成日</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Welcome (weight selection) ────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-4">
      <div className="text-center">
        <p className="text-4xl mb-2">🌅</p>
        <h1 className="text-2xl font-black text-amber-700 leading-snug">
          おはよう。<br />今日の朝を、少しだけ整えよう。
        </h1>
        <p className="text-amber-500 text-sm mt-2">
          完璧じゃなくていい。まずは体を起こすところから。
        </p>
        <p className="text-gray-400 text-xs mt-1">{formatDate(today)}</p>
      </div>

      {/* Yesterday's message */}
      {yesterdaysPrep?.messageToTomorrowSelf && (
        <div className="bg-white border border-amber-200 rounded-2xl p-4">
          <p className="text-xs text-amber-400 font-semibold mb-1">💌 昨日の自分から</p>
          <p className="text-amber-700 font-medium text-sm leading-relaxed">
            「{yesterdaysPrep.messageToTomorrowSelf}」
          </p>
        </div>
      )}

      {/* Weight selector */}
      <div>
        <p className="text-sm font-bold text-gray-600 mb-3 text-center">今の朝の重さは？</p>
        <div className="flex gap-2">
          {weightOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleWeightSelect(opt.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all active:scale-95 ${
                selectedWeight === opt.id
                  ? "bg-amber-100 border-amber-400"
                  : "bg-white border-gray-100 hover:border-amber-200"
              }`}
            >
              <span className="text-4xl">{opt.emoji}</span>
              <span className={`text-sm font-bold ${selectedWeight === opt.id ? "text-amber-700" : "text-gray-600"}`}>
                {opt.label}
              </span>
              <span className="text-xs text-gray-400 text-center leading-tight px-1">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge card */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{todayCard.icon}</span>
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">今日の雑学</p>
        </div>
        <p className="text-base font-bold text-amber-700 mb-1">{todayCard.title}</p>
        <p className="text-sm text-amber-600 leading-relaxed">{todayCard.body}</p>
      </div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-orange-500">{stats.currentStreak}</p>
          <p className="text-xs text-orange-400">🔥 連続完全達成</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-amber-500">{stats.sevenDayProgress}</p>
          <p className="text-xs text-amber-400">📆 7日中の達成日</p>
        </div>
      </div>
    </div>
  );
}
