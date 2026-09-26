import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface UnderlineTabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function UnderlineTabs({
  tabs,
  activeId,
  onChange,
  className = '',
  size = 'md',
}: UnderlineTabsProps) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const py = size === 'sm' ? 'py-1.5' : 'py-2.5';

  return (
    <div className={`border-b border-[var(--color-border)] flex gap-4 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 ${py} px-1 font-medium ${textSize} transition-colors outline-none ${
              isActive
                ? 'text-[var(--color-brand)] font-semibold'
                : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded text-[11px] font-mono ${
                  isActive
                    ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
                    : 'bg-[var(--color-surface-sunken)] text-[var(--color-ink-subtle)]'
                }`}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-brand)] rounded-t" />
            )}
          </button>
        );
      })}
    </div>
  );
}
