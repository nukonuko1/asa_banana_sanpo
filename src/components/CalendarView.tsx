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

function getRecordForDate(records: DailyRecord[], dateStr: string): DailyRecord | null {
  return records.find((r) => r.date === dateStr) ?? null;
}

function getDayStatus(record: DailyRecord | null): "complete" | "walk" | "banana" | "none" {
  if (!record) return "none";
  if (record.completed) return "complete";
  if (record.walked) return "walk";
  if (record.ateBanana) return "banana";
  return "none";
}

export default function CalendarView({ records }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  const firstDay = new Date(viewYear, viewMonth - 1, 1);
  const lastDay = new Date(viewYear, viewMonth, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else setViewMonth((m) => m + 1);
  };

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1;

  const monthlyComplete = calculateMonthlyComplete(records, viewYear, viewMonth);
  const monthlyRate = calculateMonthlyRate(records, viewYear, viewMonth);
  const currentStreak = calculateCurrentStreak(records);
  const longestStreak = calculateLongestStreak(records);

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">カレンダー</h2>

      {/* Month navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-amber-100 px-4 py-3">
        <button onClick={prevMonth} className="text-amber-600 text-xl px-2 py-1 rounded-xl hover:bg-amber-50 active:scale-95 transition-all">
          ‹
        </button>
        <span className="font-bold text-amber-700 text-lg">
          {viewYear}年 {viewMonth}月
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="text-amber-600 text-xl px-2 py-1 rounded-xl hover:bg-amber-50 active:scale-95 transition-all disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-amber-50">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className={`text-center py-2 text-xs font-semibold ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-amber-50 p-1">
          {cells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="bg-white rounded-lg h-12" />;
            }
            const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const record = getRecordForDate(records, dateStr);
            const status = getDayStatus(record);
            const isToday = dateStr === todayStr;

            const statusStyles = {
              complete: "bg-amber-400 text-white font-bold",
              walk: "bg-green-100 text-green-700",
              banana: "bg-yellow-100 text-yellow-700",
              none: "bg-white text-gray-600",
            };

            return (
              <div
                key={dateStr}
                className={`rounded-lg h-12 flex flex-col items-center justify-center relative ${statusStyles[status]} ${isToday ? "ring-2 ring-amber-500 ring-offset-1" : ""}`}
              >
                <span className={`text-sm ${status === "complete" ? "font-bold" : ""}`}>{day}</span>
                {status === "complete" && <span className="text-xs">✓</span>}
                {status === "walk" && <span className="text-xs">🚶</span>}
                {status === "banana" && <span className="text-xs">🍌</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-amber-400 rounded-md" />
          <span className="text-xs text-gray-600">両方達成</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center text-xs">🚶</div>
          <span className="text-xs text-gray-600">散歩のみ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center text-xs">🍌</div>
          <span className="text-xs text-gray-600">バナナのみ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-white border border-gray-200 rounded-md" />
          <span className="text-xs text-gray-600">未達成</span>
        </div>
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-xs text-amber-600 font-medium">今月の完全達成</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{monthlyComplete}<span className="text-base font-normal text-amber-500">日</span></p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-xs text-amber-600 font-medium">今月の達成率</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{monthlyRate}<span className="text-base font-normal text-amber-500">%</span></p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <p className="text-xs text-green-600 font-medium">現在の連続記録</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{currentStreak}<span className="text-base font-normal text-green-500">日</span></p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <p className="text-xs text-green-600 font-medium">最長連続記録</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{longestStreak}<span className="text-base font-normal text-green-500">日</span></p>
        </div>
      </div>
    </div>
  );
}
