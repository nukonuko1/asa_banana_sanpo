"use client";

import { useState } from "react";
import { DailyRecord, getTodayRecord, saveRecord, getAllRecords, getTodayString } from "@/lib/storage";

interface DailyMemoProps {
  todayRecord: DailyRecord;
  onUpdate: () => void;
  compact?: boolean;
}

export default function DailyMemo({ todayRecord, onUpdate, compact = false }: DailyMemoProps) {
  const [inputText, setInputText] = useState(todayRecord.memo || "");
  const [saved, setSaved] = useState(false);

  const allRecords = getAllRecords()
    .filter((r) => r.memo && r.memo.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  const handleSave = () => {
    const current = getTodayRecord();
    saveRecord({ ...current, memo: inputText.trim() });
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  };

  const formatDate = (dateStr: string): string => {
    const [y, m, d] = dateStr.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${m}/${d}（${weekdays[date.getDay()]}）`;
  };

  const todayStr = getTodayString();

  if (compact) {
    return (
      <div className="bg-white border border-amber-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-amber-700 mb-2">📝 今日のひとこと</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={100}
            placeholder="歩いた後の気分を一言で"
            className="flex-1 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <button
            onClick={handleSave}
            disabled={!inputText.trim()}
            className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
          >
            {saved ? "✓" : "保存"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">1行日記</h2>

      {/* Today's memo input */}
      <div className="bg-white border border-amber-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-amber-600 mb-3">今日のひとこと</p>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={150}
          placeholder="歩いた後の気分を一言で&#xa;例：少し眠かったけど、歩いたら頭がスッキリした"
          rows={3}
          className="w-full bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none text-sm"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-300">{inputText.length}/150</span>
          <button
            onClick={handleSave}
            disabled={!inputText.trim()}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              saved
                ? "bg-green-400 text-white"
                : "bg-amber-400 hover:bg-amber-500 text-white disabled:opacity-40"
            }`}
          >
            {saved ? "✓ 保存しました" : "保存する"}
          </button>
        </div>
      </div>

      {/* Examples */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-xs font-semibold text-amber-600 mb-2">記録の例</p>
        <ul className="flex flex-col gap-1">
          {[
            "少し眠かったけど、歩いたら頭がスッキリした",
            "朝の空気が気持ちよかった",
            "今日は3分だけでも外に出られた",
          ].map((ex) => (
            <li key={ex} className="text-xs text-amber-500 flex items-start gap-1">
              <span className="text-amber-300">•</span> {ex}
            </li>
          ))}
        </ul>
      </div>

      {/* Past memos */}
      {allRecords.length > 0 && (
        <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-amber-50">
            <p className="text-sm font-semibold text-amber-700">過去のひとこと</p>
          </div>
          <div className="divide-y divide-amber-50">
            {allRecords.map((r) => (
              <div key={r.date} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-amber-500">{formatDate(r.date)}</span>
                  {r.date === todayStr && (
                    <span className="bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full">今日</span>
                  )}
                  <div className="flex gap-1 ml-auto">
                    {r.walked && <span className="text-xs">🚶</span>}
                    {r.ateBanana && <span className="text-xs">🍌</span>}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{r.memo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {allRecords.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">まだ日記がありません</p>
          <p className="text-xs mt-1">散歩後の一言を記録してみましょう</p>
        </div>
      )}
    </div>
  );
}
