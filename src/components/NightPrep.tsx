"use client";

import { useState, useEffect } from "react";
import { getTodayString, getTodaysNightPrep, saveNightPrep, NightPrep as INightPrep } from "@/lib/storage";

const EXAMPLE_MESSAGES = [
  "完璧じゃなくていい。玄関まで行けば勝ち。",
  "明日の自分、おはよう。今日も一歩だけ。",
  "昨日より少しだけでいい。バナナ食べれたら十分。",
  "重くても大丈夫。外の空気を一口吸うだけでもOK。",
];

interface CheckItem {
  key: keyof Omit<INightPrep, "date" | "tomorrowMinimumAction" | "messageToTomorrowSelf">;
  emoji: string;
  label: string;
  detail: string;
}

const checkItems: CheckItem[] = [
  { key: "bananaPrepared", emoji: "🍌", label: "バナナを見える場所に置いた", detail: "朝起きてすぐ目に入る場所に" },
  { key: "shoesPrepared", emoji: "👟", label: "靴を出した", detail: "玄関に出しておくだけでOK" },
  { key: "clothesPrepared", emoji: "👕", label: "散歩する服を決めた", detail: "着替えの手間を減らす" },
  { key: "alarmSet", emoji: "⏰", label: "スマホのアラームを設定した", detail: "起きる時間の5分前も便利" },
  { key: "alarmNamed", emoji: "📛", label: "アラーム名を「朝バナナ散歩」にした", detail: "起きた瞬間に目的を思い出せる" },
];

const actionOptions = [
  { id: "walk20", label: "20分歩く" },
  { id: "walk5", label: "5分だけ外に出る" },
  { id: "bananaOnly", label: "バナナだけ食べる" },
];

export default function NightPrep() {
  const today = getTodayString();
  const existing = getTodaysNightPrep();

  const [checks, setChecks] = useState<Record<string, boolean>>({
    bananaPrepared: existing?.bananaPrepared ?? false,
    shoesPrepared: existing?.shoesPrepared ?? false,
    clothesPrepared: existing?.clothesPrepared ?? false,
    alarmSet: existing?.alarmSet ?? false,
    alarmNamed: existing?.alarmNamed ?? false,
  });
  const [tomorrowAction, setTomorrowAction] = useState(existing?.tomorrowMinimumAction ?? "");
  const [message, setMessage] = useState(existing?.messageToTomorrowSelf ?? "");
  const [saved, setSaved] = useState(false);
  const [exampleIdx, setExampleIdx] = useState(0);

  const checkedCount = Object.values(checks).filter(Boolean).length;

  const handleToggle = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    const prep: INightPrep = {
      date: today,
      bananaPrepared: checks.bananaPrepared,
      shoesPrepared: checks.shoesPrepared,
      clothesPrepared: checks.clothesPrepared,
      alarmSet: checks.alarmSet,
      alarmNamed: checks.alarmNamed,
      tomorrowMinimumAction: tomorrowAction,
      messageToTomorrowSelf: message.trim(),
    };
    saveNightPrep(prep);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fillExample = () => {
    setMessage(EXAMPLE_MESSAGES[exampleIdx % EXAMPLE_MESSAGES.length]);
    setExampleIdx((i) => i + 1);
    setSaved(false);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <div className="pt-4">
        <h2 className="text-2xl font-bold text-indigo-700">夜の準備</h2>
        <p className="text-indigo-500 text-sm mt-1">明日の朝を軽くする準備</p>
      </div>

      {/* Progress */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-indigo-700">今夜の準備</p>
          <span className="text-indigo-500 text-sm font-bold">{checkedCount} / {checkItems.length}</span>
        </div>
        <div className="h-2.5 bg-indigo-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${(checkedCount / checkItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2">
        {checkItems.map((item) => {
          const checked = checks[item.key as string];
          return (
            <button
              key={item.key}
              onClick={() => handleToggle(item.key as string)}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 ${
                checked ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100 hover:border-indigo-100"
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 text-left">
                <p className={`text-sm font-semibold ${checked ? "text-indigo-700" : "text-gray-700"}`}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-400">{item.detail}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                checked ? "bg-indigo-400 border-indigo-400" : "border-gray-200"
              }`}>
                {checked && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tomorrow's minimum action */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-sm font-bold text-gray-700 mb-3">明日の合格ラインを決める</p>
        <div className="flex flex-col gap-2">
          {actionOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setTomorrowAction(opt.id); setSaved(false); }}
              className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all active:scale-95 ${
                tomorrowAction === opt.id
                  ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                  : "bg-gray-50 border-gray-100 text-gray-600 hover:border-indigo-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message to tomorrow self */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-700">明日の自分への一言</p>
          <button
            onClick={fillExample}
            className="text-xs text-indigo-400 hover:text-indigo-600 transition-colors"
          >
            例文を使う
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => { setMessage(e.target.value); setSaved(false); }}
          maxLength={100}
          placeholder="完璧じゃなくていい。玄関まで行けば勝ち。"
          rows={2}
          className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
        />
        <p className="text-xs text-gray-300 text-right mt-1">{message.length}/100</p>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full font-bold py-4 rounded-2xl text-base active:scale-95 transition-all ${
          saved
            ? "bg-green-400 text-white"
            : "bg-indigo-400 hover:bg-indigo-500 text-white"
        }`}
      >
        {saved ? "✓ 保存しました！明日の朝に表示されます" : "🌙 明日の準備を保存する"}
      </button>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-center">
        <p className="text-indigo-500 text-xs">
          保存した内容は明日の朝、起動スイッチ画面に表示されます。
        </p>
      </div>
    </div>
  );
}
