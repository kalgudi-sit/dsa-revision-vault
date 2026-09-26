import React, { useState, useEffect, useRef } from 'react';
import { type Question } from '../../questions/types';
import { type Module } from '../../modules/types';
import { DifficultyBadge, StatusBadge } from '../../../components/ui/Badge';
import { Search, Folder, Hash, ArrowRight, CornerDownLeft, X } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  modules: Module[];
  onSelectQuestion: (question: Question) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  questions,
  modules,
  onSelectQuestion,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredQuestions = query.trim()
    ? questions.filter((q) => {
        const term = query.toLowerCase().trim();
        return (
          q.title.toLowerCase().includes(term) ||
          q.tags.some((t) => t.toLowerCase().includes(term)) ||
          q.notes.toLowerCase().includes(term)
        );
      })
    : questions.slice(0, 8); // top recent questions when query is empty

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredQuestions.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredQuestions.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredQuestions[selectedIndex];
        if (selected) {
          onSelectQuestion(selected);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredQuestions, selectedIndex, onSelectQuestion, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Search dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <Search size={18} className="text-[var(--color-brand)] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search problems, patterns, tags, or notes... (↑↓ to navigate, Enter to select)"
            className="w-full text-sm bg-transparent text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] p-1"
            >
              <X size={15} />
            </button>
          ) : (
            <span className="text-[10px] font-mono border border-[var(--color-border)] px-1.5 py-0.5 rounded text-[var(--color-ink-subtle)] bg-[var(--color-surface-sunken)]">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[var(--color-border)]/40">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-ink-subtle)]">
              No matching problems found for "{query}".
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const isSelected = idx === selectedIndex;
              const attachedModules = modules.filter((m) => q.moduleIds.includes(m.id));

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    onSelectQuestion(q);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-ink)]'
                      : 'hover:bg-[var(--color-surface-sunken)]'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-[var(--color-ink)] truncate">
                        {q.title}
                      </span>
                      <DifficultyBadge difficulty={q.difficulty} />
                      <StatusBadge status={q.status} />
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-ink-subtle)]">
                      {attachedModules.length > 0 && (
                        <span className="flex items-center gap-1 font-medium text-[var(--color-ink)]">
                          <Folder size={11} className="text-[var(--color-brand)]" />
                          {attachedModules.map((m) => m.name).join(', ')}
                        </span>
                      )}

                      {q.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Hash size={11} />
                          <span>{q.tags.slice(0, 3).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-xs text-[var(--color-ink-subtle)]">
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[var(--color-brand)] text-[11px] font-medium">
                        Open <CornerDownLeft size={11} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-[var(--color-surface-sunken)] border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-ink-subtle)]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 border border-[var(--color-border)] rounded font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="px-1 py-0.5 border border-[var(--color-border)] rounded font-mono text-[10px]">
                ↓
              </kbd>{' '}
              navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 border border-[var(--color-border)] rounded font-mono text-[10px]">
                ↵
              </kbd>{' '}
              select
            </span>
            <span>
              <kbd className="px-1 py-0.5 border border-[var(--color-border)] rounded font-mono text-[10px]">
                esc
              </kbd>{' '}
              close
            </span>
          </div>
          <span>{filteredQuestions.length} results</span>
        </div>
      </div>
    </div>
  );
}
