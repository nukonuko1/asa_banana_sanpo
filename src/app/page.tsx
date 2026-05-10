"use client";

import { useState, useEffect, useCallback } from "react";
import Navigation, { Tab } from "@/components/Navigation";
import Timer from "@/components/Timer";
import CalendarView from "@/components/CalendarView";
import StatsCards from "@/components/StatsCards";
import KnowledgeCard from "@/components/KnowledgeCard";
import DailyMemo from "@/components/DailyMemo";
import MorningSwitch from "@/components/MorningSwitch";
import NightPrep from "@/components/NightPrep";
import MoodCheck from "@/components/MoodCheck";
import SevenDayChallenge from "@/components/SevenDayChallenge";
import {
  DailyRecord,
  getAllRecords,
  getTodayRecord,
} from "@/lib/storage";
import { calculateStats, Stats } from "@/lib/stats";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("switch");
  const [todayRecord, setTodayRecord] = useState<DailyRecord | null>(null);
  const [allRecords, setAllRecords] = useState<DailyRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    const records = getAllRecords();
    const today = getTodayRecord();
    setAllRecords(records);
    setTodayRecord(today);
    setStats(calculateStats(records));
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWalkComplete = () => {
    loadData();
  };

  if (!mounted || !todayRecord || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🍌</div>
          <p className="text-amber-600 font-semibold">準備中...</p>
        </div>
      </div>
    );
  }

  const timerInitialMinutes =
    todayRecord.selectedMinimumAction === "walk5" ? 5 : 20;

  return (
    <div className="min-h-screen bg-amber-50">
      <main className="max-w-lg mx-auto pb-24">
        {activeTab === "switch" && (
          <MorningSwitch
            todayRecord={todayRecord}
            stats={stats}
            onNavigate={handleTabChange}
            onUpdate={loadData}
          />
        )}
        {activeTab === "timer" && (
          <Timer
            onWalkComplete={handleWalkComplete}
            todayRecord={todayRecord}
            initialMinutes={timerInitialMinutes}
          />
        )}
        {activeTab === "record" && (
          <RecordScreen
            todayRecord={todayRecord}
            stats={stats}
            allRecords={allRecords}
            onUpdate={loadData}
          />
        )}
        {activeTab === "seven" && (
          <SevenDayChallenge records={allRecords} />
        )}
        {activeTab === "night" && (
          <NightPrep />
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

// ─── Record Screen ────────────────────────────────────────────────────────────

interface RecordScreenProps {
  todayRecord: DailyRecord;
  stats: Stats;
  allRecords: DailyRecord[];
  onUpdate: () => void;
}

function RecordScreen({ todayRecord, stats, allRecords, onUpdate }: RecordScreenProps) {
  const [view, setView] = useState<"memo" | "calendar" | "stats" | "mood" | "learn">("memo");

  const subTabs: { id: typeof view; label: string }[] = [
    { id: "memo", label: "📝 日記" },
    { id: "calendar", label: "📅 カレンダー" },
    { id: "stats", label: "📊 統計" },
    { id: "mood", label: "😊 気分" },
    { id: "learn", label: "💡 学ぶ" },
  ];

  return (
    <div className="flex flex-col">
      <div className="bg-white border-b border-amber-100 px-2 pt-4 pb-0 overflow-x-auto">
        <div className="flex gap-1 min-w-max pb-px">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-t-xl transition-colors ${
                view === tab.id
                  ? "bg-amber-50 text-amber-600 border-t-2 border-amber-400"
                  : "text-gray-400 hover:text-amber-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view === "memo" && <DailyMemo todayRecord={todayRecord} onUpdate={onUpdate} />}
      {view === "calendar" && <CalendarView records={allRecords} />}
      {view === "stats" && <StatsCards stats={stats} />}
      {view === "mood" && <MoodCheck todayRecord={todayRecord} onUpdate={onUpdate} />}
      {view === "learn" && <KnowledgeCard />}
    </div>
  );
}
