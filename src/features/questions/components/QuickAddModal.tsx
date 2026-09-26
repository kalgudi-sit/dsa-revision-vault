import React, { useState } from 'react';
import { type QuickAddQuestionInput, type Difficulty } from '../types';
import { type Language, SUPPORTED_LANGUAGES } from '../../code-blocks/types';
import { type Module } from '../../modules/types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Sparkles, Code2, Link, FileText } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: Module[];
  defaultModuleId?: string;
  onSave: (input: QuickAddQuestionInput) => void;
}

export function QuickAddModal({
  isOpen,
  onClose,
  modules,
  defaultModuleId,
  onSave,
}: QuickAddModalProps) {
  const [title, setTitle] = useState('');
  const [primaryLink, setPrimaryLink] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [moduleId, setModuleId] = useState<string>(defaultModuleId || (modules[0]?.id ?? ''));
  const [tagsInput, setTagsInput] = useState('');
  const [initialLanguage, setInitialLanguage] = useState<Language>('JAVA');
  const [initialCode, setInitialCode] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    onSave({
      title: title.trim(),
      primaryLink: primaryLink.trim() || undefined,
      difficulty,
      moduleId: moduleId || undefined,
      tags,
      initialCode: initialCode.trim() || undefined,
      initialLanguage: initialCode.trim() ? initialLanguage : undefined,
      initialNote: initialNote.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setPrimaryLink('');
    setDifficulty('MEDIUM');
    setTagsInput('');
    setInitialCode('');
    setInitialNote('');
    setShowOptionalFields(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add Solved Question"
      subtitle="Capture problem title, source link, working code and gotchas in under 60 seconds."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core required fields */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
            Question Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Longest Substring Without Repeating Characters (LC #3)"
            className="w-full text-xs px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
              Source Link (LeetCode, GFG, TUF)
            </label>
            <div className="relative">
              <Link size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
              <input
                type="url"
                value={primaryLink}
                onChange={(e) => setPrimaryLink(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
                Module / Pattern
              </label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]"
              >
                <option value="">None / Unassigned</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
            Tags (comma-separated, e.g. sliding-window, amazon, two-pointers)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="sliding-window, array, amazon"
            className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        {/* Optional code and notes toggle */}
        <div className="pt-1 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="text-xs text-[var(--color-brand)] font-medium hover:underline flex items-center gap-1"
          >
            {showOptionalFields ? '− Hide code & mistake note' : '+ Paste your code & mistake note now'}
          </button>
        </div>

        {showOptionalFields && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[var(--color-ink-subtle)] flex items-center gap-1.5">
                  <Code2 size={13} />
                  <span>Your Working Solution</span>
                </label>
                <div className="flex items-center gap-1">
                  {(['JAVA', 'CPP', 'PYTHON'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setInitialLanguage(lang)}
                      className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                        initialLanguage === lang
                          ? 'bg-[var(--color-brand)] text-white font-semibold'
                          : 'bg-[var(--color-surface-sunken)] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
                      }`}
                    >
                      {SUPPORTED_LANGUAGES[lang].name}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={initialCode}
                onChange={(e) => setInitialCode(e.target.value)}
                rows={5}
                placeholder="// Paste your working code solution here..."
                className="w-full font-mono text-xs p-2.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1 flex items-center gap-1.5">
                <FileText size={13} />
                <span>Quick Gotchas & Mistake Log</span>
              </label>
              <textarea
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                rows={2}
                placeholder="What was the main bug or key realization on this attempt?"
                className="w-full text-xs p-2.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
          <Button size="sm" variant="subtle" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit">
            Save Question
          </Button>
        </div>
      </form>
    </Modal>
  );
}
