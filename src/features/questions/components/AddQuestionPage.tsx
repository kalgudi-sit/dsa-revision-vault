import React, { useState } from 'react';
import { type Difficulty, type RevisionStatus } from '../types';
import { type Sheet } from '../../sheets/types';
import { type Module } from '../../modules/types';
import { type Language } from '../../code-blocks/types';
import { Button } from '../../../components/ui/Button';
import {
  ArrowLeft,
  Save,
  Code2,
  BookOpen,
  Tag,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  FileCode,
  Layers,
} from 'lucide-react';

interface AddQuestionPageProps {
  sheets: Sheet[];
  modules: Module[];
  defaultSheetId?: string | null;
  defaultModuleId?: string | null;
  onBack: () => void;
  onSave: (questionData: {
    title: string;
    links: string[];
    difficulty: Difficulty;
    status: RevisionStatus;
    tags: string[];
    notes: string;
    sheetIds: string[];
    moduleIds: string[];
    mySolutionCode: string;
    mySolutionLanguage: Language;
    optimalSolutionCode: string;
    optimalSolutionLanguage: Language;
  }) => void;
}

export function AddQuestionPage({
  sheets,
  modules,
  defaultSheetId,
  defaultModuleId,
  onBack,
  onSave,
}: AddQuestionPageProps) {
  // Form State
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [status, setStatus] = useState<RevisionStatus>('NEEDS_REVISION');
  const [selectedSheetIds, setSelectedSheetIds] = useState<string[]>(() =>
    defaultSheetId ? [defaultSheetId] : sheets.length > 0 ? [sheets[0].id] : []
  );
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>(() =>
    defaultModuleId ? [defaultModuleId] : modules.length > 0 ? [modules[0].id] : []
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['leetcode', 'must-revise']);

  // Notes state
  const [notes, setNotes] = useState(
    `### Core Approach & Intuition\n- Outline key invariant or monotonic property.\n- What triggers the window shift or pointer movement?\n\n### Mistake Log & Gotchas\n- **Edge cases**: Empty input, single element, duplicates.\n- **Common error**: Off-by-one or condition mismatch.\n\n### Complexities\n- **Time**: $O(N)$\n- **Space**: $O(1)$`
  );
  const [activeNotesTab, setActiveNotesTab] = useState<'edit' | 'preview'>('edit');

  // Code state
  const [activeCodeTab, setActiveCodeTab] = useState<'my' | 'optimal'>('my');
  const [myLanguage, setMyLanguage] = useState<Language>('JAVA');
  const [myCode, setMyCode] = useState(`class Solution {\n    public int solve() {\n        // Your implementation\n        return 0;\n    }\n}`);
  const [optimalLanguage, setOptimalLanguage] = useState<Language>('CPP');
  const [optimalCode, setOptimalCode] = useState(`// Optimal / Editorial solution\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int solve() {\n        return 0;\n    }\n};`);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Tag helper
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Sheet toggle
  const toggleSheet = (sheetId: string) => {
    setSelectedSheetIds((prev) =>
      prev.includes(sheetId) ? prev.filter((id) => id !== sheetId) : [...prev, sheetId]
    );
  };

  // Module toggle
  const toggleModule = (moduleId: string) => {
    setSelectedModuleIds((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Question title is required.');
      return;
    }

    const links = urlInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('http://') || l.startsWith('https://'));

    onSave({
      title: title.trim(),
      links,
      difficulty,
      status,
      tags,
      notes,
      sheetIds: selectedSheetIds,
      moduleIds: selectedModuleIds,
      mySolutionCode: myCode,
      mySolutionLanguage: myLanguage,
      optimalSolutionCode: optimalCode,
      optimalSolutionLanguage: optimalLanguage,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[var(--color-surface)]">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="subtle"
            onClick={onBack}
            icon={<ArrowLeft size={14} />}
          >
            Back to Problems
          </Button>
          <div className="h-4 w-[1px] bg-[var(--color-border)]" />
          <div>
            <h1 className="text-base font-bold text-[var(--color-ink)] leading-none">
              Add New Problem
            </h1>
            <span className="text-[11px] text-[var(--color-ink-subtle)]">
              Full problem entry with multi-language code & mistake log
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="subtle" onClick={onBack}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleFormSubmit}
            icon={<Save size={14} />}
          >
            Save Problem
          </Button>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleFormSubmit} className="max-w-5xl mx-auto w-full p-6 space-y-6">
        {validationError && (
          <div className="p-3 rounded text-xs bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border border-red-200 dark:border-red-900 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Section 1: Basic Problem Details */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={14} className="text-[var(--color-brand)]" />
            <span>Problem Identity</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Problem Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. Longest Consecutive Sequence"
                className="w-full text-sm px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                      difficulty === d
                        ? d === 'EASY'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : d === 'MEDIUM'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-purple-600 text-white border-purple-600'
                        : 'bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1 flex items-center gap-1.5">
                <LinkIcon size={12} className="text-[var(--color-ink-subtle)]" />
                <span>Problem URLs (LeetCode, TUF, etc.)</span>
              </label>
              <textarea
                rows={2}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://leetcode.com/problems/...\nhttps://takeuforward.org/..."
                className="w-full text-xs font-mono px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[var(--color-ink-subtle)]" />
                <span>Initial Revision Status</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'NEEDS_REVISION', label: 'Needs Revision' },
                    { id: 'CONFIDENT', label: 'Confident' },
                    { id: 'NOT_REVISED', label: 'Not Revised' },
                  ] as { id: RevisionStatus; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded border transition-colors ${
                      status === s.id
                        ? s.id === 'CONFIDENT'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                          : s.id === 'NEEDS_REVISION'
                          ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-zinc-200 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200'
                        : 'bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Sheets & Modules Taxonomy */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} className="text-[var(--color-brand)]" />
            <span>Sheets & Pattern Modules</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sheets */}
            <div>
              <span className="block text-xs font-semibold text-[var(--color-ink)] mb-2">
                Belongs to Sheets (Select all that apply)
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {sheets.map((sheet) => {
                  const isChecked = selectedSheetIds.includes(sheet.id);
                  return (
                    <label
                      key={sheet.id}
                      className={`flex items-center gap-2.5 p-2 rounded border cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'bg-[var(--color-brand-subtle)] border-[var(--color-brand)] text-[var(--color-brand)] font-medium'
                          : 'bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSheet(sheet.id)}
                        className="rounded text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                      />
                      <span className="truncate">{sheet.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modules */}
            <div>
              <span className="block text-xs font-semibold text-[var(--color-ink)] mb-2">
                Belongs to Pattern Modules
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {modules.map((mod) => {
                  const isChecked = selectedModuleIds.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                        isChecked
                          ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] font-medium'
                          : 'bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      {mod.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="pt-2 border-t border-[var(--color-border)]">
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5 flex items-center gap-1.5">
              <Tag size={12} className="text-[var(--color-ink-subtle)]" />
              <span>Tags</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--color-ink)]"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-500 font-bold ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag and press Enter..."
                className="flex-1 text-xs px-2.5 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              />
              <Button size="sm" variant="subtle" type="button" onClick={handleAddTag}>
                Add Tag
              </Button>
            </div>
          </div>
        </div>

        {/* Section 3: Notes & Mistake Log */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-2">
              <FolderKanban size={14} className="text-[var(--color-brand)]" />
              <span>Approach, Mistakes & Complexity Notes</span>
            </h2>
            <div className="flex items-center gap-1 border border-[var(--color-border)] rounded p-0.5 bg-[var(--color-surface-sunken)]">
              <button
                type="button"
                onClick={() => setActiveNotesTab('edit')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeNotesTab === 'edit'
                    ? 'bg-[var(--color-surface)] text-[var(--color-ink)] font-semibold shadow-2xs'
                    : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
                }`}
              >
                Markdown Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveNotesTab('preview')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeNotesTab === 'preview'
                    ? 'bg-[var(--color-surface)] text-[var(--color-ink)] font-semibold shadow-2xs'
                    : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
                }`}
              >
                Formatted Preview
              </button>
            </div>
          </div>

          {activeNotesTab === 'edit' ? (
            <textarea
              rows={8}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          ) : (
            <div className="p-4 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] min-h-[160px] text-xs space-y-2 whitespace-pre-wrap font-sans text-[var(--color-ink)]">
              {notes}
            </div>
          )}
        </div>

        {/* Section 4: Multi-Language Code Blocks */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-2">
              <Code2 size={14} className="text-[var(--color-brand)]" />
              <span>Multi-Source Code Solutions</span>
            </h2>

            {/* Tabs for My Solution vs Optimal Solution */}
            <div className="flex items-center gap-1 border border-[var(--color-border)] rounded p-0.5 bg-[var(--color-surface-sunken)]">
              <button
                type="button"
                onClick={() => setActiveCodeTab('my')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  activeCodeTab === 'my'
                    ? 'bg-[var(--color-brand)] text-white font-semibold shadow-2xs'
                    : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
                }`}
              >
                My Solution
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab('optimal')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  activeCodeTab === 'optimal'
                    ? 'bg-[var(--color-brand)] text-white font-semibold shadow-2xs'
                    : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
                }`}
              >
                Optimal / Editorial Solution
              </button>
            </div>
          </div>

          {activeCodeTab === 'my' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-ink)]">
                  My Working Implementation
                </span>
                <select
                  value={myLanguage}
                  onChange={(e) => setMyLanguage(e.target.value as Language)}
                  className="text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]"
                >
                  <option value="JAVA">Java</option>
                  <option value="CPP">C++</option>
                  <option value="PYTHON">Python</option>
                  <option value="JAVASCRIPT">JavaScript</option>
                  <option value="TYPESCRIPT">TypeScript</option>
                </select>
              </div>
              <textarea
                rows={12}
                value={myCode}
                onChange={(e) => setMyCode(e.target.value)}
                className="w-full text-xs font-mono p-3 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-ink)]">
                  Optimal / Internet / TUF Reference Solution
                </span>
                <select
                  value={optimalLanguage}
                  onChange={(e) => setOptimalLanguage(e.target.value as Language)}
                  className="text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]"
                >
                  <option value="CPP">C++</option>
                  <option value="JAVA">Java</option>
                  <option value="PYTHON">Python</option>
                  <option value="JAVASCRIPT">JavaScript</option>
                  <option value="TYPESCRIPT">TypeScript</option>
                </select>
              </div>
              <textarea
                rows={12}
                value={optimalCode}
                onChange={(e) => setOptimalCode(e.target.value)}
                className="w-full text-xs font-mono p-3 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button size="md" variant="subtle" onClick={onBack}>
            Cancel
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={handleFormSubmit}
            icon={<Save size={16} />}
          >
            Save Problem to Vault
          </Button>
        </div>
      </form>
    </div>
  );
}
