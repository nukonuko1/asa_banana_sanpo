"use client";

import { useState } from "react";
import { knowledgeCards, KnowledgeCard as IKnowledgeCard, getTodaysCard } from "@/data/knowledgeCards";

interface KnowledgeCardProps {
  compact?: boolean;
}

export default function KnowledgeCard({ compact = false }: KnowledgeCardProps) {
  const todaysCard = getTodaysCard();
  const [selectedCard, setSelectedCard] = useState<IKnowledgeCard>(todaysCard);
  const [showAll, setShowAll] = useState(false);

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{todaysCard.icon}</span>
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">今日の雑学</p>
        </div>
        <p className="text-base font-bold text-amber-700 mb-1">{todaysCard.title}</p>
        <p className="text-sm text-amber-600 leading-relaxed">{todaysCard.body}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h2 className="text-2xl font-bold text-amber-700 pt-4">朝の雑学</h2>

      {/* Today's featured card */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full">今日のカード</span>
        </div>
        <span className="text-5xl block mb-3">{todaysCard.icon}</span>
        <h3 className="text-xl font-bold text-amber-700 mb-2">{todaysCard.title}</h3>
        <p className="text-amber-600 leading-relaxed">{todaysCard.body}</p>
      </div>

      {/* Selected card (if different from today's) */}
      {selectedCard.id !== todaysCard.id && (
        <div className="bg-white border border-amber-100 rounded-2xl p-5">
          <span className="text-4xl block mb-2">{selectedCard.icon}</span>
          <h3 className="text-lg font-bold text-gray-700 mb-2">{selectedCard.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{selectedCard.body}</p>
        </div>
      )}

      {/* All cards toggle */}
      <button
        onClick={() => setShowAll((p) => !p)}
        className="w-full bg-amber-50 border border-amber-100 rounded-2xl py-3 text-amber-600 font-semibold text-sm hover:bg-amber-100 active:scale-95 transition-all"
      >
        {showAll ? "▲ カードを閉じる" : `▼ 全${knowledgeCards.length}枚のカードを見る`}
      </button>

      {/* All cards grid */}
      {showAll && (
        <div className="flex flex-col gap-3">
          {knowledgeCards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className={`text-left rounded-2xl p-4 border transition-all active:scale-95 ${
                card.id === todaysCard.id
                  ? "bg-amber-50 border-amber-300"
                  : card.id === selectedCard.id
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-100 hover:border-amber-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{card.icon}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-700">{card.title}</p>
                    {card.id === todaysCard.id && (
                      <span className="bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full">今日</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{card.body}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
