import React from 'react';
import { type Difficulty, type RevisionStatus } from '../../features/questions/types';
import { type Language, SUPPORTED_LANGUAGES } from '../../features/code-blocks/types';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  switch (difficulty) {
    case 'EASY':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          Easy
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          Medium
        </span>
      );
    case 'HARD':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
          Hard
        </span>
      );
  }
}

export function StatusBadge({ status }: { status: RevisionStatus }) {
  switch (status) {
    case 'CONFIDENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Confident
        </span>
      );
    case 'NEEDS_REVISION':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Needs Revision
        </span>
      );
    case 'NOT_REVISED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Not Revised
        </span>
      );
  }
}

export function TagBadge({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-surface-sunken)] text-[var(--color-ink)] border border-[var(--color-border)]">
      <span>{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-[var(--color-danger)] transition-colors"
          title="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  );
}

export function LanguageBadge({ language }: { language: Language }) {
  const config = SUPPORTED_LANGUAGES[language];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${config.badgeBg}`}>
      {config.name}
    </span>
  );
}
