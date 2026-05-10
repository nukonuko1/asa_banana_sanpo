"use client";

export type Tab = "switch" | "timer" | "record" | "seven" | "night";

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "switch", label: "朝スイッチ", icon: "🌅" },
  { id: "timer", label: "タイマー", icon: "⏱️" },
  { id: "record", label: "記録", icon: "📝" },
  { id: "seven", label: "7日", icon: "📆" },
  { id: "night", label: "夜セット", icon: "🌙" },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 z-50">
      <div className="flex items-stretch max-w-lg mx-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 transition-colors relative ${
              activeTab === tab.id ? "text-amber-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl leading-none mb-0.5">{tab.icon}</span>
            <span className={`text-xs font-medium ${activeTab === tab.id ? "text-amber-600" : "text-gray-400"}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-b-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
