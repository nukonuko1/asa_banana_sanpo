"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getTodayRecord, saveRecord, DailyRecord } from "@/lib/storage";
import { MoodSelector } from "@/components/MoodCheck";

interface TimerProps {
  onWalkComplete: () => void;
  todayRecord: DailyRecord;
  initialMinutes?: number;
}

const DURATION_OPTIONS = [5, 20, 30, 60];

function playBeep() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio not available
  }
}

type Phase = "mood-before" | "timer" | "mood-after" | "done";

export default function Timer({ onWalkComplete, todayRecord, initialMinutes = 20 }: TimerProps) {
  const [phase, setPhase] = useState<Phase>(() => {
    if (todayRecord.walked && todayRecord.moodAfter) return "done";
    if (todayRecord.walked) return "mood-after";
    if (todayRecord.moodBefore) return "timer";
    return "mood-before";
  });

  const [selectedMinutes, setSelectedMinutes] = useState(initialMinutes);
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTurnaround, setShowTurnaround] = useState(false);
  const turnaroundShownRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = selectedMinutes * 60;
  const halfwaySeconds = totalSeconds / 2;

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    playBeep();
    const record = getTodayRecord();
    saveRecord({ ...record, walked: true, walkMinutes: selectedMinutes });
    onWalkComplete();
    setPhase("mood-after");
  }, [selectedMinutes, onWalkComplete]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          if (!turnaroundShownRef.current && next <= halfwaySeconds && next > halfwaySeconds - 2) {
            setShowTurnaround(true);
            turnaroundShownRef.current = true;
            setTimeout(() => setShowTurnaround(false), 5000);
          }
          if (next <= 0) {
            handleComplete();
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, halfwaySeconds, handleComplete]);

  const handleDurationChange = (mins: number) => {
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    setIsPaused(false);
    setShowTurnaround(false);
    turnaroundShownRef.current = false;
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setShowTurnaround(false);
    turnaroundShownRef.current = false;
    setTimeLeft(selectedMinutes * 60);
    if (!todayRecord.walked) {
      setPhase(todayRecord.moodBefore ? "timer" : "mood-before");
    }
  };

  const handleSaveMoodBefore = (value: number) => {
    const record = getTodayRecord();
    saveRecord({ ...record, moodBefore: value });
    onWalkComplete();
    setPhase("timer");
  };

  const handleSaveMoodAfter = (value: number) => {
    const record = getTodayRecord();
    saveRecord({ ...record, moodAfter: value });
    onWalkComplete();
    setPhase("done");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const is5min = selectedMinutes === 5;
  const MOOD_EMOJIS = ["😫", "😔", "😐", "🙂", "😊"];

  // ── Mood Before ───────────────────────────────────────────────────────────
  if (phase === "mood-before") {
    return (
      <div className="flex flex-col gap-5 px-4 pb-4">
        <h2 className="text-2xl font-bold text-amber-700 pt-4">朝散歩タイマー</h2>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <p className="text-amber-600 text-sm">散歩の前に、今の気分を記録しておきましょう。</p>
          <p className="text-amber-400 text-xs mt-1">歩いた後にどれだけ変わったか、後で見えます。</p>
        </div>
        <MoodSelector type="before" currentValue={todayRecord.moodBefore} onSave={handleSaveMoodBefore} />
        <button onClick={() => setPhase("timer")} className="text-center text-gray-400 text-xs py-1">
          スキップしてタイマーへ
        </button>
      </div>
    );
  }

  // ── Mood After ────────────────────────────────────────────────────────────
  if (phase === "mood-after") {
    const before = todayRecord.moodBefore;
    return (
      <div className="flex flex-col gap-5 px-4 pb-4">
        <h2 className="text-2xl font-bold text-amber-700 pt-4">朝散歩タイマー</h2>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">🌿</p>
          <p className="text-green-700 font-bold">
            {is5min ? "5分できました。今日はこれで十分です。" : "朝散歩完了！おつかれさまでした。"}
          </p>
          {is5min && (
            <p className="text-green-500 text-sm mt-1">ゼロにしなかったことが、明日につながります。</p>
          )}
          {before && (
            <p className="text-green-500 text-xs mt-1">散歩前: {MOOD_EMOJIS[before - 1]}　歩いた後は？</p>
          )}
        </div>
        <MoodSelector type="after" currentValue={todayRecord.moodAfter} onSave={handleSaveMoodAfter} />
        <button onClick={() => setPhase("done")} className="text-center text-gray-400 text-xs py-1">
          スキップ
        </button>
      </div>
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const before = todayRecord.moodBefore;
    const after = todayRecord.moodAfter;
    const improved = before !== undefined && after !== undefined && after > before;
    return (
      <div className="flex flex-col gap-4 px-4 pb-4">
        <h2 className="text-2xl font-bold text-amber-700 pt-4">朝散歩タイマー</h2>
        <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center">
          <p className="text-5xl mb-3">🌿</p>
          <p className="text-green-700 font-bold text-lg">今日の土台づくり、完了です。</p>
          {improved && (
            <p className="text-green-500 text-sm mt-2">
              {MOOD_EMOJIS[before! - 1]} → {MOOD_EMOJIS[after! - 1]}　歩いた後、少し軽くなりましたね。
            </p>
          )}
          {!improved && before !== undefined && after !== undefined && (
            <p className="text-green-400 text-xs mt-2">
              変化が少ない日もあります。それでも記録したこと自体が、自分を知る一歩です。
            </p>
          )}
        </div>
        <button
          onClick={() => { setPhase("mood-before"); handleReset(); }}
          className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-4 rounded-2xl active:scale-95 transition-all"
        >
          もう一度タイマーをセット
        </button>
      </div>
    );
  }

  // ── Timer ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">朝散歩タイマー</h2>

      {/* Duration selector */}
      <div className="flex gap-2 bg-amber-50 p-1.5 rounded-2xl w-full justify-center">
        {DURATION_OPTIONS.map((mins) => (
          <button
            key={mins}
            onClick={() => handleDurationChange(mins)}
            disabled={isRunning}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedMinutes === mins
                ? "bg-amber-400 text-white shadow-sm"
                : "text-amber-600 hover:bg-amber-100"
            } disabled:opacity-60`}
          >
            {mins}分
          </button>
        ))}
      </div>

      {/* 5-min mode label */}
      {is5min && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-center w-full">
          <p className="text-indigo-600 text-sm font-semibold">
            今日は5分だけ外に出る。それで十分です。
          </p>
        </div>
      )}

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="260" height="260" className="-rotate-90">
          <circle cx="130" cy="130" r="110" fill="none" stroke="#FEF3C7" strokeWidth="12" />
          <circle
            cx="130" cy="130" r="110"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-6xl font-bold text-amber-700 tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-sm text-amber-500 mt-1">
            {isRunning && !isPaused ? "歩いています…" : isPaused ? "一時停止中" : "準備OK"}
          </span>
        </div>
      </div>

      {showTurnaround && (
        <div className="bg-orange-100 border border-orange-200 rounded-2xl px-6 py-3 text-center w-full animate-pulse">
          <p className="text-orange-700 font-semibold">🔄 そろそろ折り返し地点です</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 w-full">
        {!isRunning ? (
          <button
            onClick={() => { setIsRunning(true); setIsPaused(false); }}
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-bold py-4 rounded-2xl text-lg shadow-sm active:scale-95 transition-all"
          >
            🚶 開始する
          </button>
        ) : (
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-4 rounded-2xl text-lg active:scale-95 transition-all"
          >
            {isPaused ? "▶ 再開する" : "⏸ 一時停止"}
          </button>
        )}
        <button
          onClick={handleReset}
          className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold py-4 px-5 rounded-2xl text-lg active:scale-95 transition-all"
        >
          ↺
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 w-full">
        <p className="text-yellow-700 text-sm">
          💡 {is5min
            ? "玄関を出て、少し空気を吸うだけでOK。5分でも外に出れば十分です。"
            : "外の空気を吸いながら、ゆっくりしたペースで歩きましょう。急ぐ必要はありません。"
          }
        </p>
      </div>
    </div>
  );
}
