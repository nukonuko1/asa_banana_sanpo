"use client";

import { useState } from "react";

interface ProgramOfferProps {
  onClose: () => void;
}

const features = [
  { icon: "📅", text: "30日分の朝ミッション" },
  { icon: "💡", text: "30日分の朝の知識カード" },
  { icon: "🆘", text: "仕事に行きたくない朝レスキュー" },
  { icon: "🌧️", text: "雨の日モード" },
  { icon: "😴", text: "寝坊した日モード" },
  { icon: "💜", text: "メンタル重い日モード" },
  { icon: "📊", text: "7日ごとの振り返り" },
  { icon: "😊", text: "気分変化レポート" },
  { icon: "🏆", text: "30日達成証" },
  { icon: "📄", text: "PDFチェックシート（予定）" },
];

export default function ProgramOffer({ onClose }: ProgramOfferProps) {
  const [showMsg, setShowMsg] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto max-h-[92vh] overflow-y-auto">
        <div className="px-5 pt-6 pb-8 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div />
            <button onClick={onClose} className="text-gray-400 text-2xl w-8 h-8 flex items-center justify-center">
              ×
            </button>
          </div>

          <div className="text-center">
            <div className="inline-block bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
              PREMIUM
            </div>
            <h2 className="text-2xl font-black text-gray-800 leading-snug">
              朝バナナ散歩<br />30日リセットプログラム
            </h2>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              仕事に行きたくない朝を、いきなり変えようとしなくていい。<br />
              まずは30日、朝の最小行動を固定する。
            </p>
          </div>

          {/* Price */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-xs text-amber-500 font-medium">30日プログラム</p>
            <p className="text-4xl font-black text-amber-700 mt-1">
              ¥1,980
            </p>
            <p className="text-xs text-gray-400 mt-1">買い切り / 返金保証なし</p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-2">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3 py-2 border-b border-gray-50">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm text-gray-700">{f.text}</span>
                <span className="ml-auto text-green-400 text-sm">✓</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {showMsg ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <p className="text-amber-700 font-semibold text-sm">
                30日プログラムは準備中です。
              </p>
              <p className="text-amber-500 text-sm mt-1">
                まずは無料の7日チャレンジを続けてみましょう。
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowMsg(true)}
              className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black py-5 rounded-2xl text-lg active:scale-95 transition-all shadow-md"
            >
              30日プログラムを始める
            </button>
          )}

          <button onClick={onClose} className="text-center text-gray-400 text-sm py-2">
            今は無料の7日チャレンジを続ける
          </button>
        </div>
      </div>
    </div>
  );
}
