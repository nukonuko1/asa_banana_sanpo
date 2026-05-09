"use client";

export type Tab = "home" | "timer" | "record" | "calendar" | "learn";

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "ホーム", icon: "🏠" },
  { id: "timer", label: "タイマー", icon: "⏱️" },
  { id: "record", label: "記録", icon: "📝" },
  { id: "calendar", label: "カレンダー", icon: "📅" },
  { id: "learn", label: "学ぶ", icon: "💡" },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 z-50 safe-area-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-colors ${
              activeTab === tab.id
                ? "text-amber-600"
                : "text-gray-400 hover:text-amber-400"
            }`}
          >
            <span className="text-2xl leading-none mb-0.5">{tab.icon}</span>
            <span className={`text-xs font-medium ${activeTab === tab.id ? "text-amber-600" : "text-gray-400"}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
