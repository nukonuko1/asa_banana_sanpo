"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getTodayRecord, saveRecord } from "@/lib/storage";

interface TimerProps {
  onWalkComplete: () => void;
}

const DURATION_OPTIONS = [20, 30, 60];

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio not available
  }
}

export default function Timer({ onWalkComplete }: TimerProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(20);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTurnaround, setShowTurnaround] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const turnaroundShownRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = selectedMinutes * 60;
  const halfwaySeconds = totalSeconds / 2;

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setIsComplete(true);
    playBeep();
    const record = getTodayRecord();
    saveRecord({ ...record, walked: true, walkMinutes: selectedMinutes });
    onWalkComplete();
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

  const handleStart = () => {
    if (isComplete) return;
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused((p) => !p);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    setShowTurnaround(false);
    turnaroundShownRef.current = false;
    setTimeLeft(selectedMinutes * 60);
  };

  const handleDurationChange = (mins: number) => {
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    setShowTurnaround(false);
    turnaroundShownRef.current = false;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">朝散歩タイマー</h2>

      {/* Duration selector */}
      <div className="flex gap-3 bg-amber-50 p-1.5 rounded-2xl">
        {DURATION_OPTIONS.map((mins) => (
          <button
            key={mins}
            onClick={() => handleDurationChange(mins)}
            disabled={isRunning}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedMinutes === mins
                ? "bg-amber-400 text-white shadow-sm"
                : "text-amber-600 hover:bg-amber-100"
            } disabled:opacity-60`}
          >
            {mins}分
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="260" height="260" className="-rotate-90">
          <circle
            cx="130" cy="130" r="110"
            fill="none"
            stroke="#FEF3C7"
            strokeWidth="12"
          />
          <circle
            cx="130" cy="130" r="110"
            fill="none"
            stroke={isComplete ? "#22c55e" : "#F59E0B"}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          {isComplete ? (
            <span className="text-5xl">🎉</span>
          ) : (
            <>
              <span className="text-6xl font-bold text-amber-700 tabular-nums">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span className="text-sm text-amber-500 mt-1">
                {isRunning && !isPaused ? "歩いています…" : isPaused ? "一時停止中" : "準備OK"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Turnaround notification */}
      {showTurnaround && (
        <div className="bg-orange-100 border border-orange-200 rounded-2xl px-6 py-3 text-center animate-pulse">
          <p className="text-orange-700 font-semibold">🔄 そろそろ折り返し地点です</p>
        </div>
      )}

      {/* Complete message */}
      {isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 text-center w-full">
          <p className="text-2xl mb-2">🌟</p>
          <p className="text-green-700 font-bold text-lg">朝散歩完了！</p>
          <p className="text-green-600 text-sm mt-1">
            今日の土台づくり、おつかれさまでした。
          </p>
        </div>
      )}

      {/* Buttons */}
      {!isComplete && (
        <div className="flex gap-3 w-full">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-bold py-4 rounded-2xl text-lg shadow-sm active:scale-95 transition-all"
            >
              🚶 開始する
            </button>
          ) : (
            <button
              onClick={handlePause}
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
      )}

      {isComplete && (
        <button
          onClick={handleReset}
          className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-4 rounded-2xl text-lg active:scale-95 transition-all"
        >
          もう一度タイマーをセット
        </button>
      )}

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 w-full">
        <p className="text-yellow-700 text-sm">
          💡 外の空気を吸いながら、ゆっくりしたペースで歩きましょう。
          急ぐ必要はありません。
        </p>
      </div>
    </div>
  );
}
