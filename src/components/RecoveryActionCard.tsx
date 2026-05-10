"use client";

import { getTodayRecord, saveRecord } from "@/lib/storage";

interface RecoveryActionCardProps {
  isBananaEaten: boolean;
  onUpdate: () => void;
}

export default function RecoveryActionCard({ isBananaEaten, onUpdate }: RecoveryActionCardProps) {
  const handleBananaOnly = () => {
    const record = getTodayRecord();
    saveRecord({
      ...record,
      ateBanana: true,
      selectedMinimumAction: "bananaOnly",
      recoveryCompleted: true,
    });
    onUpdate();
  };

  if (isBananaEaten) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
        <p className="text-2xl mb-1">🍌</p>
        <p className="text-yellow-700 font-bold">バナナ達成！</p>
        <p className="text-yellow-600 text-sm mt-1 leading-relaxed">
          今日はバナナだけでもOK。<br />
          完全じゃなくても、続ける流れは残せました。
        </p>
        <div className="mt-2 bg-white rounded-xl px-3 py-1.5 inline-block">
          <span className="text-xs text-indigo-500 font-semibold">🔄 リカバリー達成</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
      <p className="text-sm font-bold text-yellow-700 mb-1">🍌 バナナだけモード</p>
      <p className="text-xs text-yellow-600 mb-3 leading-relaxed">
        今日は歩けなくても大丈夫。まずはバナナを食べて、朝の習慣の火を消さないようにしましょう。
      </p>
      <button
        onClick={handleBananaOnly}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl text-base active:scale-95 transition-all"
      >
        バナナを食べた
      </button>
    </div>
  );
}
