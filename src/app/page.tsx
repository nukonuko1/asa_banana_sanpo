"use client";

import { useState, useEffect, useCallback } from "react";
import Navigation, { Tab } from "@/components/Navigation";
import Timer from "@/components/Timer";
import TodayCheck from "@/components/TodayCheck";
import CalendarView from "@/components/CalendarView";
import StatsCards from "@/components/StatsCards";
import GrowthPlant from "@/components/GrowthPlant";
import KnowledgeCard from "@/components/KnowledgeCard";
import DailyMemo from "@/components/DailyMemo";
import {
  DailyRecord,
  getAllRecords,
  getTodayRecord,
  saveRecord,
  getTodayString,
} from "@/lib/storage";
import { calculateStats, Stats } from "@/lib/stats";

function formatJapaneseDate(date: Date): string {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
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

  const handleBanana = () => {
    const current = getTodayRecord();
    saveRecord({ ...current, ateBanana: true });
    loadData();
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

  return (
    <div className="min-h-screen bg-amber-50">
      <main className="max-w-lg mx-auto pb-24">
        {activeTab === "home" && (
          <HomeScreen
            todayRecord={todayRecord}
            stats={stats}
            allRecords={allRecords}
            onBanana={handleBanana}
            onTabChange={handleTabChange}
            onUpdate={loadData}
          />
        )}
        {activeTab === "timer" && (
          <Timer onWalkComplete={handleWalkComplete} />
        )}
        {activeTab === "record" && (
          <RecordScreen
            todayRecord={todayRecord}
            stats={stats}
            onUpdate={loadData}
          />
        )}
        {activeTab === "calendar" && (
          <CalendarView records={allRecords} />
        )}
        {activeTab === "learn" && (
          <LearnScreen stats={stats} />
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

// ─── Home Screen ────────────────────────────────────────────────────────────

interface HomeScreenProps {
  todayRecord: DailyRecord;
  stats: Stats;
  allRecords: DailyRecord[];
  onBanana: () => void;
  onTabChange: (tab: Tab) => void;
  onUpdate: () => void;
}

function HomeScreen({ todayRecord, stats, allRecords, onBanana, onTabChange, onUpdate }: HomeScreenProps) {
  const today = new Date();
  const bothComplete = todayRecord.walked && todayRecord.ateBanana;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">🍌</span>
          <h1 className="text-3xl font-black text-amber-700">朝バナナ散歩</h1>
          <span className="text-3xl">🚶</span>
        </div>
        <p className="text-amber-500 font-semibold text-sm">朝20分、人生を整える。</p>
        <p className="text-gray-400 text-xs mt-0.5">{formatJapaneseDate(today)}</p>
      </div>

      {/* Today's status */}
      <div className={`rounded-3xl p-4 border-2 ${bothComplete ? "bg-gradient-to-r from-amber-50 to-green-50 border-amber-300" : "bg-white border-amber-100"}`}>
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">今日の状態</p>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-2xl py-3 px-4 flex items-center gap-3 ${todayRecord.walked ? "bg-green-100" : "bg-gray-50"}`}>
            <span className="text-2xl">{todayRecord.walked ? "✅" : "🚶"}</span>
            <div>
              <p className="text-xs text-gray-500">朝散歩</p>
              <p className={`text-sm font-bold ${todayRecord.walked ? "text-green-600" : "text-gray-400"}`}>
                {todayRecord.walked ? `${todayRecord.walkMinutes}分完了` : "今日はまだ"}
              </p>
            </div>
          </div>
          <div className={`rounded-2xl py-3 px-4 flex items-center gap-3 ${todayRecord.ateBanana ? "bg-yellow-100" : "bg-gray-50"}`}>
            <span className="text-2xl">{todayRecord.ateBanana ? "✅" : "🍌"}</span>
            <div>
              <p className="text-xs text-gray-500">バナナ</p>
              <p className={`text-sm font-bold ${todayRecord.ateBanana ? "text-yellow-600" : "text-gray-400"}`}>
                {todayRecord.ateBanana ? "食べた！" : "今日はまだ"}
              </p>
            </div>
          </div>
        </div>

        {bothComplete && (
          <div className="mt-3 text-center bg-white rounded-2xl py-2 px-3">
            <p className="text-amber-600 font-semibold text-sm">🌟 今日の朝リズム、完成です！</p>
            <p className="text-amber-400 text-xs">小さな一歩が積み上がっています。</p>
          </div>
        )}
      </div>

      {/* Main action buttons */}
      {!todayRecord.walked && (
        <button
          onClick={() => onTabChange("timer")}
          className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black py-5 rounded-3xl text-xl shadow-md active:scale-95 transition-all"
        >
          🚶 20分朝散歩を始める
        </button>
      )}

      {todayRecord.walked && !todayRecord.ateBanana && (
        <button
          onClick={onBanana}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-black py-5 rounded-3xl text-xl shadow-md active:scale-95 transition-all"
        >
          🍌 バナナを食べた！
        </button>
      )}

      {todayRecord.walked && todayRecord.ateBanana && (
        <button
          onClick={() => onTabChange("timer")}
          className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-bold py-4 rounded-3xl text-lg active:scale-95 transition-all"
        >
          ✓ 今日の習慣、完了です！
        </button>
      )}

      {/* Secondary buttons */}
      <div className="grid grid-cols-2 gap-3">
        {!todayRecord.ateBanana && todayRecord.walked && (
          <button
            onClick={onBanana}
            className="bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 text-yellow-700 font-semibold py-3 rounded-2xl text-sm active:scale-95 transition-all"
          >
            🍌 バナナを食べた
          </button>
        )}
        {!todayRecord.walked && (
          <button
            onClick={onBanana}
            disabled={todayRecord.ateBanana}
            className="bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 text-yellow-700 font-semibold py-3 rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {todayRecord.ateBanana ? "🍌 バナナ済み" : "🍌 バナナを食べた"}
          </button>
        )}
        <button
          onClick={() => onTabChange("record")}
          className="bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 font-semibold py-3 rounded-2xl text-sm active:scale-95 transition-all"
        >
          📝 今日のひとことを書く
        </button>
      </div>

      {/* Streak & monthly stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-orange-500">{stats.currentStreak}</p>
          <p className="text-xs text-orange-400 font-medium mt-0.5">🔥 連続達成日数</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-amber-500">{stats.monthlyComplete}</p>
          <p className="text-xs text-amber-400 font-medium mt-0.5">📅 今月の達成日数</p>
        </div>
      </div>

      {/* Plant growth preview */}
      <button onClick={() => onTabChange("learn")} className="text-left active:scale-95 transition-all">
        <GrowthPlant completeCount={stats.completeCount} compact />
      </button>

      {/* Today's knowledge card */}
      <button onClick={() => onTabChange("learn")} className="text-left active:scale-95 transition-all">
        <KnowledgeCard compact />
      </button>

      {/* Memo quick entry */}
      <DailyMemo todayRecord={todayRecord} onUpdate={onUpdate} compact />

      {/* About section */}
      <div className="bg-white border border-amber-100 rounded-2xl p-4">
        <p className="text-sm font-bold text-amber-700 mb-2">💚 このアプリについて</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          「朝バナナ散歩」は、朝20分歩いてバナナを食べるという小さな習慣を継続支援するアプリです。
          散歩は無料でできる。バナナは手に入りやすい。やる気と小さな仕組みさえあれば、心と体の土台作りができます。
        </p>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          ※ このアプリは医療・医学的アドバイスを提供するものではありません。
          健康上の課題がある方は専門家にご相談ください。
        </p>
      </div>
    </div>
  );
}

// ─── Record Screen ───────────────────────────────────────────────────────────

interface RecordScreenProps {
  todayRecord: DailyRecord;
  stats: Stats;
  onUpdate: () => void;
}

function RecordScreen({ todayRecord, stats, onUpdate }: RecordScreenProps) {
  const [view, setView] = useState<"memo" | "stats" | "check">("memo");

  return (
    <div className="flex flex-col">
      {/* Sub navigation */}
      <div className="flex gap-1 bg-white border-b border-amber-100 px-4 pt-4 pb-0">
        {(["memo", "check", "stats"] as const).map((v) => {
          const labels = { memo: "📝 日記", check: "✅ チェック", stats: "📊 記録" };
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
                view === v
                  ? "bg-amber-50 text-amber-600 border-t-2 border-amber-400"
                  : "text-gray-400 hover:text-amber-400"
              }`}
            >
              {labels[v]}
            </button>
          );
        })}
      </div>

      {view === "memo" && (
        <DailyMemo todayRecord={todayRecord} onUpdate={onUpdate} />
      )}
      {view === "check" && (
        <TodayCheck record={todayRecord} onUpdate={onUpdate} />
      )}
      {view === "stats" && (
        <StatsCards stats={stats} />
      )}
    </div>
  );
}

// ─── Learn Screen ────────────────────────────────────────────────────────────

interface LearnScreenProps {
  stats: Stats;
}

function LearnScreen({ stats }: LearnScreenProps) {
  const [view, setView] = useState<"cards" | "plant">("cards");

  return (
    <div className="flex flex-col">
      {/* Sub navigation */}
      <div className="flex gap-1 bg-white border-b border-amber-100 px-4 pt-4 pb-0">
        {(["cards", "plant"] as const).map((v) => {
          const labels = { cards: "💡 雑学カード", plant: "🌱 植物育成" };
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
                view === v
                  ? "bg-amber-50 text-amber-600 border-t-2 border-amber-400"
                  : "text-gray-400 hover:text-amber-400"
              }`}
            >
              {labels[v]}
            </button>
          );
        })}
      </div>

      {view === "cards" && <KnowledgeCard />}
      {view === "plant" && <GrowthPlant completeCount={stats.completeCount} />}
    </div>
  );
}
