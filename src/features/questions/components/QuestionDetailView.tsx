import React, { useState } from 'react';
import {
  type Question,
  type RevisionStatus,
  type Difficulty,
  type UpdateQuestionInput,
} from '../types';
import { type CodeBlock, type SolutionSource, type Language } from '../../code-blocks/types';
import { type Sheet } from '../../sheets/types';
import { type Module } from '../../modules/types';
import { DifficultyBadge, StatusBadge, TagBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { CodeBlockViewer } from '../../code-blocks/components/CodeBlockViewer';
import {
  ExternalLink,
  Edit,
  Trash2,
  FolderKanban,
  FileText,
  Save,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Copy,
  Check,
} from 'lucide-react';

interface QuestionDetailViewProps {
  question: Question;
  allSheets: Sheet[];
  allModules: Module[];
  onUpdateQuestion: (input: UpdateQuestionInput) => void;
  onUpdateStatus: (id: string, status: RevisionStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteQuestion: (id: string) => void;
  onAddCodeVersion: (source: SolutionSource, language: Language, label: string, code: string) => void;
  onUpdateCodeBlock: (block: CodeBlock) => void;
  onDeleteCodeBlock: (blockId: string) => void;
}

export function QuestionDetailView({
  question,
  allSheets,
  allModules,
  onUpdateQuestion,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteQuestion,
  onAddCodeVersion,
  onUpdateCodeBlock,
  onDeleteCodeBlock,
}: QuestionDetailViewProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesBuffer, setNotesBuffer] = useState(question.notes);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [copiedLinkNotice, setCopiedLinkNotice] = useState(false);

  // Edit question metadata state
  const [editTitle, setEditTitle] = useState(question.title);
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>(question.difficulty);
  const [editLinks, setEditLinks] = useState(question.links.join('\n'));
  const [editTags, setEditTags] = useState(question.tags.join(', '));
  const [selectedModules, setSelectedModules] = useState<string[]>(question.moduleIds);
  const [selectedSheets, setSelectedSheets] = useState<string[]>(question.sheetIds);

  const attachedSheets = allSheets.filter((s) => question.sheetIds.includes(s.id));
  const attachedModules = allModules.filter((m) => question.moduleIds.includes(m.id));

  const handleSaveNotes = () => {
    onUpdateNotes(question.id, notesBuffer);
    setIsEditingNotes(false);
  };

  const handleOpenEditModal = () => {
    setEditTitle(question.title);
    setEditDifficulty(question.difficulty);
    setEditLinks(question.links.join('\n'));
    setEditTags(question.tags.join(', '));
    setSelectedModules(question.moduleIds);
    setSelectedSheets(question.sheetIds);
    setIsEditModalOpen(true);
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    const links = editLinks
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const tags = editTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    onUpdateQuestion({
      id: question.id,
      title: editTitle.trim(),
      difficulty: editDifficulty,
      links,
      tags,
      status: question.status,
      notes: question.notes,
      moduleIds: selectedModules,
      sheetIds: selectedSheets,
    });

    setIsEditModalOpen(false);
  };

  const insertMistakeTemplate = () => {
    const template = `\n\n### Mistake Log & Gotchas\n- **What went wrong**: \n- **Why it failed**: \n- **Key realization**: `;
    setNotesBuffer((prev) => prev + template);
    setIsEditingNotes(true);
  };

  const handleDeleteConfirmed = () => {
    onDeleteQuestion(question.id);
    setIsDeleteModalOpen(false);
  };

  const handleCopyTitleAndLinks = () => {
    const text = `${question.title}\n${question.links.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedLinkNotice(true);
    setTimeout(() => setCopiedLinkNotice(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-surface)]">
      {/* Question Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-3 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-[var(--color-ink)] tracking-tight">
              {question.title}
            </h1>
            <DifficultyBadge difficulty={question.difficulty} />
            <StatusBadge status={question.status} />

            <button
              type="button"
              onClick={handleCopyTitleAndLinks}
              className="text-xs text-[var(--color-ink-subtle)] hover:text-[var(--color-brand)] flex items-center gap-1 ml-1"
              title="Copy problem title and links"
            >
              {copiedLinkNotice ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copiedLinkNotice ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          {/* Quick status change buttons & Actions */}
          <div className="flex items-center gap-1.5 self-start md:self-auto flex-wrap">
            <span className="text-xs text-[var(--color-ink-subtle)] mr-1">Status:</span>
            <button
              type="button"
              onClick={() => onUpdateStatus(question.id, 'NEEDS_REVISION')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                question.status === 'NEEDS_REVISION'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-semibold ring-1 ring-amber-400'
                  : 'text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-sunken)]'
              }`}
            >
              Needs Revision
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(question.id, 'CONFIDENT')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                question.status === 'CONFIDENT'
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-semibold ring-1 ring-emerald-400'
                  : 'text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-sunken)]'
              }`}
            >
              Confident
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(question.id, 'NOT_REVISED')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                question.status === 'NOT_REVISED'
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 font-semibold ring-1 ring-zinc-400'
                  : 'text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-sunken)]'
              }`}
            >
              Not Revised
            </button>

            <div className="h-4 w-px bg-[var(--color-border)] mx-1" />

            <Button size="sm" variant="subtle" onClick={handleOpenEditModal} icon={<Edit size={14} />}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                setDeleteConfirmText('');
                setIsDeleteModalOpen(true);
              }}
              className="text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-950/40"
              icon={<Trash2 size={14} />}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Links, Tags & Module Associations */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs">
          {/* External links */}
          {question.links.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-ink-subtle)]">Links:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {question.links.map((link, idx) => {
                  let host = 'Link';
                  try {
                    host = new URL(link).hostname.replace('www.', '');
                  } catch {
                    host = `Link ${idx + 1}`;
                  }
                  return (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--color-brand)] hover:underline font-medium bg-[var(--color-brand-subtle)] px-2 py-0.5 rounded"
                    >
                      <ExternalLink size={11} />
                      <span>{host}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[var(--color-ink-subtle)]">Tags:</span>
              <div className="flex flex-wrap items-center gap-1">
                {question.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            </div>
          )}

          {/* Module / Sheet categorization */}
          <div className="flex items-center gap-2 text-[var(--color-ink-subtle)]">
            <FolderKanban size={13} />
            <span>
              {attachedModules.map((m) => m.name).join(', ') || 'No Module'}
            </span>
          </div>

          {/* Last viewed timestamp */}
          <div className="flex items-center gap-1 text-[var(--color-ink-subtle)] ml-auto">
            <Clock size={12} />
            <span>
              Last viewed:{' '}
              {question.lastViewedAt
                ? new Date(question.lastViewedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left column (Notes & Mistake log) + Right column (Code Block Viewer) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto lg:overflow-hidden min-h-0">
        {/* Left Column: Notes & Mistake Log (lg:col-span-5) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">
          <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-[var(--color-brand)]" />
              <span className="text-xs font-semibold text-[var(--color-ink)]">
                Approach, Mistake Log & Notes
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="subtle"
                onClick={insertMistakeTemplate}
                icon={<AlertTriangle size={13} className="text-amber-500" />}
              >
                + Mistake
              </Button>
              {isEditingNotes ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveNotes}
                  icon={<Save size={13} />}
                >
                  Save
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => {
                    setNotesBuffer(question.notes);
                    setIsEditingNotes(true);
                  }}
                  icon={<Edit size={13} />}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col min-h-0">
            {isEditingNotes ? (
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <textarea
                  value={notesBuffer}
                  onChange={(e) => setNotesBuffer(e.target.value)}
                  rows={20}
                  className="w-full flex-1 p-3 text-xs font-sans rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] leading-relaxed resize-none"
                  placeholder="Record your intuition, mistakes you made, edge cases, and complexity..."
                />
                <div className="flex justify-end gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => {
                      setNotesBuffer(question.notes);
                      setIsEditingNotes(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" variant="primary" onClick={handleSaveNotes}>
                    Save Notes
                  </Button>
                </div>
              </div>
            ) : question.notes ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed space-y-2">
                {question.notes.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h4
                        key={idx}
                        className="text-xs font-bold text-[var(--color-ink)] mt-3 mb-1 border-b border-[var(--color-border)] pb-1"
                      >
                        {paragraph.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h3
                        key={idx}
                        className="text-sm font-bold text-[var(--color-ink)] mt-3 mb-1 text-[var(--color-brand)]"
                      >
                        {paragraph.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n- ');
                    return (
                      <ul key={idx} className="list-disc pl-4 space-y-1 text-[var(--color-ink)]">
                        {items.map((it, i) => (
                          <li key={i} className="text-xs leading-relaxed">
                            {it.replace(/^- /, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={idx} className="text-xs text-[var(--color-ink)] whitespace-pre-line">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[var(--color-surface-sunken)] rounded border border-dashed border-[var(--color-border)]">
                <FileText size={28} className="text-[var(--color-ink-subtle)]/40 mb-2" />
                <p className="text-xs font-medium text-[var(--color-ink)] mb-1">
                  No notes recorded yet
                </p>
                <p className="text-[11px] text-[var(--color-ink-subtle)] max-w-xs mb-3">
                  Write down your approach, what tripped you up, or critical edge cases so you never repeat the same bug.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNotesBuffer(
                      `### Core Approach\n\n\n### Mistake Log & Gotchas\n- \n\n### Complexities\n- Time: \n- Space: `
                    );
                    setIsEditingNotes(true);
                  }}
                >
                  Write Initial Notes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: CodeBlockViewer (lg:col-span-7) */}
        <div className="lg:col-span-7 h-full flex flex-col overflow-hidden p-3 bg-[var(--color-surface-sunken)]">
          <CodeBlockViewer
            questionId={question.id}
            codeBlocks={question.codeBlocks}
            onAddVersion={onAddCodeVersion}
            onUpdateVersion={onUpdateCodeBlock}
            onDeleteVersion={onDeleteCodeBlock}
          />
        </div>
      </div>

      {/* Robust Delete Question Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-2xl w-full max-w-md z-10 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-danger-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--color-danger)]">
                <AlertTriangle size={18} />
                <h3 className="text-sm font-semibold">Delete Problem from Vault</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-xs text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-[var(--color-ink)]">
                Are you sure you want to delete <strong className="font-semibold text-[var(--color-brand)]">{question.title}</strong>?
              </p>
              <p className="text-[var(--color-ink-subtle)]">
                This will permanently delete all {question.codeBlocks.length} code solution versions and notes for this question from your local vault.
              </p>

              <div className="pt-2">
                <label className="block text-[11px] text-[var(--color-ink-subtle)] mb-1">
                  Type <strong className="text-[var(--color-ink)]">delete</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="delete"
                  className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
                <Button
                  size="sm"
                  variant="subtle"
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={deleteConfirmText.toLowerCase().trim() !== 'delete'}
                  onClick={handleDeleteConfirmed}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Metadata Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl w-full max-w-xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">Edit Question Details</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-xs text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="p-4 space-y-3 overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
                  Question Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
                  Difficulty
                </label>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value as Difficulty)}
                  className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
                  Source URLs (LeetCode, TUF, YouTube - 1 per line)
                </label>
                <textarea
                  value={editLinks}
                  onChange={(e) => setEditLinks(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  placeholder="https://leetcode.com/problems/..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="two-pointers, sliding-window, amazon"
                  className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
                  Belongs to Modules (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-[var(--color-border)] rounded bg-[var(--color-surface-sunken)]">
                  {allModules.map((mod) => {
                    const isChecked = selectedModules.includes(mod.id);
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedModules(selectedModules.filter((id) => id !== mod.id));
                          } else {
                            setSelectedModules([...selectedModules, mod.id]);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded transition-colors ${
                          isChecked
                            ? 'bg-[var(--color-brand)] text-white font-medium'
                            : 'bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)]'
                        }`}
                      >
                        {mod.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
                <Button
                  size="sm"
                  variant="subtle"
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
