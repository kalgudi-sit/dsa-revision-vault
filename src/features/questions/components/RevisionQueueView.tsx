import React from 'react';
import { type Question, type RevisionStatus } from '../types';
import { DifficultyBadge, StatusBadge, TagBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Clock, CheckCircle2, RotateCcw, ArrowRight, AlertCircle, Sparkles, Folder } from 'lucide-react';
import { type Module } from '../../modules/types';

interface RevisionQueueViewProps {
  questions: Question[];
  modules: Module[];
  onSelectQuestion: (question: Question) => void;
  onUpdateStatus: (id: string, status: RevisionStatus) => void;
}

export function RevisionQueueView({
  questions,
  modules,
  onSelectQuestion,
  onUpdateStatus,
}: RevisionQueueViewProps) {
  const needsRevisionQuestions = questions
    .filter((q) => q.status === 'NEEDS_REVISION')
    .sort((a, b) => {
      if (!a.lastViewedAt) return -1;
      if (!b.lastViewedAt) return 1;
      return new Date(a.lastViewedAt).getTime() - new Date(b.lastViewedAt).getTime();
    });

  const now = Date.now();
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

  const overdueCount = needsRevisionQuestions.filter((q) => {
    if (!q.lastViewedAt) return true;
    return now - new Date(q.lastViewedAt).getTime() > FOURTEEN_DAYS_MS;
  }).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[var(--color-surface)] p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[var(--color-ink)]">
              Pre-Interview Revision Queue
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              {needsRevisionQuestions.length} pending
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-subtle)]">
            Prioritized by least-recently-revised. Open a question, review your personal notes and mistake log, check the code, and mark as confident.
          </p>
        </div>

        {overdueCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
            <AlertCircle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>{overdueCount}</strong> question{overdueCount > 1 ? 's' : ''} not viewed in over 14 days
            </span>
          </div>
        )}
      </div>

      {/* Questions List */}
      {needsRevisionQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--color-surface-sunken)] rounded-md border border-[var(--color-border)] my-auto">
          <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
          <h3 className="text-base font-semibold text-[var(--color-ink)] mb-1">
            Queue Clear! You are all caught up.
          </h3>
          <p className="text-xs text-[var(--color-ink-subtle)] max-w-sm mb-4">
            No problems currently marked with "Needs Revision". As you solve more problems or flag older patterns, they will queue up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {needsRevisionQuestions.map((q) => {
            const isOverdue =
              !q.lastViewedAt || now - new Date(q.lastViewedAt).getTime() > FOURTEEN_DAYS_MS;

            const daysSinceView = q.lastViewedAt
              ? Math.floor((now - new Date(q.lastViewedAt).getTime()) / (1000 * 60 * 60 * 24))
              : null;

            const attachedModules = modules.filter((m) => q.moduleIds.includes(m.id));

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className={`p-4 rounded-md border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isOverdue
                    ? 'border-amber-300 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-400'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand)]'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-semibold text-sm text-[var(--color-ink)] hover:text-[var(--color-brand)] truncate">
                      {q.title}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                    {isOverdue && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-medium">
                        Due for review
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-ink-subtle)]">
                    {attachedModules.length > 0 && (
                      <span className="flex items-center gap-1 font-medium text-[var(--color-ink)]">
                        <Folder size={12} className="text-[var(--color-brand)]" />
                        {attachedModules.map((m) => m.name).join(', ')}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {daysSinceView === null
                        ? 'Never viewed'
                        : daysSinceView === 0
                        ? 'Viewed today'
                        : `Viewed ${daysSinceView} day${daysSinceView > 1 ? 's' : ''} ago`}
                    </span>

                    {q.codeBlocks.length > 0 && (
                      <span>
                        {q.codeBlocks.length} code version{q.codeBlocks.length > 1 ? 's' : ''}
                      </span>
                    )}

                    {q.tags.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        {q.tags.slice(0, 3).map((t) => (
                          <TagBadge key={t} tag={t} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct quick action buttons */}
                <div
                  className="flex items-center gap-2 shrink-0 self-end md:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                    onClick={() => onUpdateStatus(q.id, 'CONFIDENT')}
                    icon={<CheckCircle2 size={13} className="text-emerald-500" />}
                  >
                    Mark Confident
                  </Button>

                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => onSelectQuestion(q)}
                  >
                    Revise Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
