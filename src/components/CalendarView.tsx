"use client";

import { useState } from "react";
import { DailyRecord } from "@/lib/storage";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateMonthlyComplete,
  calculateMonthlyRate,
} from "@/lib/stats";

interface CalendarViewProps {
  records: DailyRecord[];
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function getDayStatus(r: DailyRecord | null): "complete" | "recovery" | "walk" | "banana" | "none" {
  if (!r) return "none";
  if (r.completed) return "complete";
  if (r.recoveryCompleted) return "recovery";
  if (r.walked) return "walk";
  if (r.ateBanana) return "banana";
  return "none";
}

const STATUS_CLASS: Record<string, string> = {
  complete: "bg-amber-400 text-white font-bold",
  recovery: "bg-indigo-200 text-indigo-700",
  walk: "bg-green-100 text-green-700",
  banana: "bg-yellow-100 text-yellow-700",
  none: "bg-white text-gray-400",
};

const STATUS_ICON: Record<string, string> = {
  complete: "✓",
  recovery: "◎",
  walk: "🚶",
  banana: "🍌",
  none: "",
};

export default function CalendarView({ records }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  const firstDay = new Date(viewYear, viewMonth - 1, 1);
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const startWeekday = firstDay.getDay();

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1;

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else setViewMonth((m) => m + 1);
  };

  const monthlyComplete = calculateMonthlyComplete(records, viewYear, viewMonth);
  const monthlyRate = calculateMonthlyRate(records, viewYear, viewMonth);
  const currentStreak = calculateCurrentStreak(records);
  const longestStreak = calculateLongestStreak(records);

  const monthlyRecovery = records.filter((r) => {
    if (!r.recoveryCompleted || r.completed) return false;
    const d = new Date(r.date + "T00:00:00");
    return d.getFullYear() === viewYear && d.getMonth() + 1 === viewMonth;
  }).length;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">カレンダー</h2>

      {/* Month navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-amber-100 px-4 py-3">
        <button onClick={prevMonth} className="text-amber-600 text-2xl px-2 hover:bg-amber-50 rounded-xl">‹</button>
        <span className="font-bold text-amber-700 text-lg">{viewYear}年 {viewMonth}月</span>
        <button onClick={nextMonth} disabled={isCurrentMonth} className="text-amber-600 text-2xl px-2 hover:bg-amber-50 rounded-xl disabled:opacity-30">›</button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
        <div className="grid grid-cols-7 bg-amber-50">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className={`text-center py-2 text-xs font-semibold ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-50 p-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} className="bg-white rounded-lg h-12" />;
            const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const record = records.find((r) => r.date === dateStr) ?? null;
            const status = getDayStatus(record);
            const isToday = dateStr === todayStr;
            return (
              <div
                key={dateStr}
                className={`rounded-lg h-12 flex flex-col items-center justify-center relative ${STATUS_CLASS[status]} ${isToday ? "ring-2 ring-amber-500 ring-offset-1" : ""}`}
              >
                <span className="text-sm">{day}</span>
                {STATUS_ICON[status] && <span className="text-xs leading-none">{STATUS_ICON[status]}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center">
        {[
          { style: "bg-amber-400", label: "完全達成" },
          { style: "bg-indigo-200", label: "リカバリー" },
          { style: "bg-green-100", label: "散歩のみ" },
          { style: "bg-yellow-100", label: "バナナのみ" },
          { style: "bg-white border border-gray-200", label: "まだ" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-md ${item.style}`} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs text-amber-500 font-medium">完全達成</p>
          <p className="text-3xl font-black text-amber-700">{monthlyComplete}<span className="text-base font-normal text-amber-400">日</span></p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <p className="text-xs text-indigo-500 font-medium">リカバリー達成</p>
          <p className="text-3xl font-black text-indigo-700">{monthlyRecovery}<span className="text-base font-normal text-indigo-400">日</span></p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-xs text-green-500 font-medium">連続完全達成</p>
          <p className="text-3xl font-black text-green-700">{currentStreak}<span className="text-base font-normal text-green-400">日</span></p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-xs text-green-500 font-medium">最長連続記録</p>
          <p className="text-3xl font-black text-green-700">{longestStreak}<span className="text-base font-normal text-green-400">日</span></p>
        </div>
      </div>
    </div>
  );
}
