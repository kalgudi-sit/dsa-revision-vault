import React, { useState } from 'react';
import {
  type Question,
  type Difficulty,
  type RevisionStatus,
} from '../types';
import { DifficultyBadge, StatusBadge, TagBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  FolderKanban,
  FileCode,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { type Module } from '../../modules/types';
import { type Sheet } from '../../sheets/types';

interface QuestionListViewProps {
  questions: Question[];
  currentSheet?: Sheet | null;
  currentModule?: Module | null;
  allModules: Module[];
  onSelectQuestion: (question: Question) => void;
  onOpenQuickAdd: () => void;
  onUpdateStatus: (id: string, status: RevisionStatus) => void;
  onDeleteQuestion?: (id: string) => void;
}

export function QuestionListView({
  questions,
  currentSheet,
  currentModule,
  allModules,
  onSelectQuestion,
  onOpenQuickAdd,
  onUpdateStatus,
  onDeleteQuestion,
}: QuestionListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Question delete confirmation modal
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // Filter questions
  const filtered = questions.filter((q) => {
    if (difficultyFilter !== 'ALL' && q.difficulty !== difficultyFilter) return false;
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (selectedTag && !q.tags.includes(selectedTag)) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(term);
      const matchTag = q.tags.some((t) => t.toLowerCase().includes(term));
      const matchNotes = q.notes.toLowerCase().includes(term);
      if (!matchTitle && !matchTag && !matchNotes) return false;
    }
    return true;
  });

  // Calculate difficulty stats
  const easyCount = questions.filter((q) => q.difficulty === 'EASY').length;
  const mediumCount = questions.filter((q) => q.difficulty === 'MEDIUM').length;
  const hardCount = questions.filter((q) => q.difficulty === 'HARD').length;
  const confidentCount = questions.filter((q) => q.status === 'CONFIDENT').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[var(--color-surface)] p-6">
      {/* Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)] mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--color-ink)]">
              {currentModule
                ? currentModule.name
                : currentSheet
                ? currentSheet.name
                : 'All Questions'}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-sunken)] border border-[var(--color-border)] font-mono text-[var(--color-ink-subtle)]">
              {questions.length} problems
            </span>
          </div>
          {currentModule?.description && (
            <p className="text-xs text-[var(--color-ink-subtle)] mt-1">
              {currentModule.description}
            </p>
          )}
          {currentSheet?.description && !currentModule && (
            <p className="text-xs text-[var(--color-ink-subtle)] mt-1">
              {currentSheet.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenQuickAdd}
            icon={<Plus size={14} />}
          >
            + New Question
          </Button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] flex flex-col">
          <span className="text-[11px] font-medium text-[var(--color-ink-subtle)]">Mastered (Confident)</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {confidentCount} / {questions.length}
          </span>
        </div>
        <div className="p-3 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] flex flex-col">
          <span className="text-[11px] font-medium text-[var(--color-ink-subtle)]">Easy Problems</span>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {easyCount}
          </span>
        </div>
        <div className="p-3 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] flex flex-col">
          <span className="text-[11px] font-medium text-[var(--color-ink-subtle)]">Medium Problems</span>
          <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
            {mediumCount}
          </span>
        </div>
        <div className="p-3 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] flex flex-col">
          <span className="text-[11px] font-medium text-[var(--color-ink-subtle)]">Hard Problems</span>
          <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
            {hardCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 bg-[var(--color-surface-sunken)] p-2.5 rounded border border-[var(--color-border)]">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems by name, tag, or notes..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--color-ink-subtle)]">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]"
            >
              <option value="ALL">All</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--color-ink-subtle)]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]"
            >
              <option value="ALL">All</option>
              <option value="NEEDS_REVISION">Needs Revision</option>
              <option value="CONFIDENT">Confident</option>
              <option value="NOT_REVISED">Not Revised</option>
            </select>
          </div>

          {(difficultyFilter !== 'ALL' || statusFilter !== 'ALL' || selectedTag || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setDifficultyFilter('ALL');
                setStatusFilter('ALL');
                setSelectedTag(null);
                setSearchTerm('');
              }}
              className="text-xs text-[var(--color-brand)] hover:underline whitespace-nowrap pl-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Selected Tag Pill */}
      {selectedTag && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-[var(--color-ink-subtle)]">Filtered by tag:</span>
          <TagBadge tag={selectedTag} onRemove={() => setSelectedTag(null)} />
        </div>
      )}

      {/* Questions Table / List */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface-sunken)] rounded border border-dashed border-[var(--color-border)]">
          <FileCode size={32} className="text-[var(--color-ink-subtle)]/50 mb-2" />
          <p className="text-xs font-semibold text-[var(--color-ink)] mb-1">
            No questions found
          </p>
          <p className="text-[11px] text-[var(--color-ink-subtle)] max-w-xs mb-3">
            {questions.length === 0
              ? 'No questions attached to this module yet.'
              : 'No questions match your current search/filters.'}
          </p>
          <Button size="sm" variant="primary" onClick={onOpenQuickAdd} icon={<Plus size={13} />}>
            Add Question
          </Button>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] rounded-md overflow-hidden bg-[var(--color-surface)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)] text-[var(--color-ink-subtle)] font-medium">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">Status</th>
                <th className="py-2.5 px-4">Problem Title</th>
                <th className="py-2.5 px-4 w-28">Difficulty</th>
                <th className="py-2.5 px-4 hidden md:table-cell">Modules / Tags</th>
                <th className="py-2.5 px-4 w-24 text-center hidden sm:table-cell">Solutions</th>
                <th className="py-2.5 px-4 w-28 text-right">Last Reviewed</th>
                <th className="py-2.5 px-3 w-12 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((q) => {
                const attachedModules = allModules.filter((m) => q.moduleIds.includes(m.id));
                return (
                  <tr
                    key={q.id}
                    onClick={() => onSelectQuestion(q)}
                    className="hover:bg-[var(--color-surface-sunken)]/60 cursor-pointer transition-colors group"
                  >
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus: RevisionStatus =
                            q.status === 'CONFIDENT'
                              ? 'NEEDS_REVISION'
                              : q.status === 'NEEDS_REVISION'
                              ? 'CONFIDENT'
                              : 'NEEDS_REVISION';
                          onUpdateStatus(q.id, nextStatus);
                        }}
                        className="transition-transform active:scale-90"
                        title={`Status: ${q.status}. Click to toggle.`}
                      >
                        {q.status === 'CONFIDENT' ? (
                          <CheckCircle2 size={16} className="text-emerald-500 inline" />
                        ) : q.status === 'NEEDS_REVISION' ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 bg-amber-100 dark:bg-amber-950 inline-block" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 inline-block" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--color-ink)] group-hover:text-[var(--color-brand)]">
                          {q.title}
                        </span>
                        {q.links.length > 0 && (
                          <a
                            href={q.links[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[var(--color-ink-subtle)] hover:text-[var(--color-brand)]"
                            title="Open external problem link"
                          >
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <DifficultyBadge difficulty={q.difficulty} />
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap items-center gap-1">
                        {attachedModules.map((m) => (
                          <span
                            key={m.id}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--color-ink-subtle)] font-medium"
                          >
                            {m.name}
                          </span>
                        ))}
                        {q.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(t);
                            }}
                            className="text-[10px] text-[var(--color-ink-subtle)] hover:underline cursor-pointer"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center hidden sm:table-cell">
                      <span className="text-[11px] font-mono text-[var(--color-ink-subtle)]">
                        {q.codeBlocks.length} ver
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-[var(--color-ink-subtle)] whitespace-nowrap">
                      {q.lastViewedAt
                        ? new Date(q.lastViewedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Never'}
                    </td>

                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onDeleteQuestion && (
                        <button
                          type="button"
                          onClick={() => setQuestionToDelete(q)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-ink-subtle)] hover:text-[var(--color-danger)] transition-all rounded hover:bg-[var(--color-surface)]"
                          title="Delete question"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Question Confirmation Dialog */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setQuestionToDelete(null)}
          />
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-2xl w-full max-w-sm z-10 overflow-hidden flex flex-col p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--color-danger)]">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-semibold">Delete Problem</h3>
            </div>
            <p className="text-xs text-[var(--color-ink)]">
              Are you sure you want to delete <strong className="font-semibold">{questionToDelete.title}</strong>? All solutions and mistake notes will be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button size="sm" variant="subtle" onClick={() => setQuestionToDelete(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (onDeleteQuestion) {
                    onDeleteQuestion(questionToDelete.id);
                  }
                  setQuestionToDelete(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
