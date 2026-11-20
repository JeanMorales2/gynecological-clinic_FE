"use client";

import { useState, type ReactNode } from "react";

export type TabItem = {
  label: string;
  value: string;
  content: ReactNode;
};

export type TabsProps = {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
};

export function Tabs({ tabs, defaultValue, className = "" }: TabsProps) {
  const firstTab = tabs[0];
  const [activeValue, setActiveValue] = useState(defaultValue ?? firstTab?.value ?? "");
  const activeTab = tabs.find((tab) => tab.value === activeValue) ?? firstTab;

  if (!firstTab) return null;

  return (
    <div className={className}>
      <div aria-label="Pestañas" className="flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab.value;
          return (
            <button
              aria-controls={`tab-panel-${tab.value}`}
              aria-selected={isActive}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${isActive ? "border-primary text-primary" : "border-transparent text-text-secondary hover:border-primary-border hover:text-text"}`}
              id={`tab-${tab.value}`}
              key={tab.value}
              onClick={() => setActiveValue(tab.value)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div aria-labelledby={`tab-${activeTab.value}`} className="pt-5" id={`tab-panel-${activeTab.value}`} role="tabpanel">
        {activeTab.content}
      </div>
    </div>
  );
}