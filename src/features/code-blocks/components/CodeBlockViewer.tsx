import React, { useState } from 'react';
import {
  type CodeBlock,
  type Language,
  type SolutionSource,
  SUPPORTED_LANGUAGES,
} from '../types';
import { UnderlineTabs, type TabItem } from '../../../components/ui/UnderlineTabs';
import { Button } from '../../../components/ui/Button';
import {
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Code2,
  Maximize2,
  Minimize2,
  Search,
  WrapText,
  Download,
} from 'lucide-react';

interface CodeBlockViewerProps {
  questionId: string;
  codeBlocks: CodeBlock[];
  onAddVersion: (source: SolutionSource, language: Language, label: string, code: string) => void;
  onUpdateVersion: (codeBlock: CodeBlock) => void;
  onDeleteVersion: (codeBlockId: string) => void;
}

export function CodeBlockViewer({
  questionId,
  codeBlocks,
  onAddVersion,
  onUpdateVersion,
  onDeleteVersion,
}: CodeBlockViewerProps) {
  const [activeSource, setActiveSource] = useState<SolutionSource>('MY_SOLUTION');
  const [activeLanguage, setActiveLanguage] = useState<Language>('JAVA');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [newVersionCode, setNewVersionCode] = useState('');

  // Usability features: Full screen code view, line wrap toggle, search within code
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWordWrap, setIsWordWrap] = useState(false);
  const [codeFilterQuery, setCodeFilterQuery] = useState('');
  const [fontSize, setFontSize] = useState<'xs' | 'sm' | 'base'>('xs');

  // Filter versions for active source & language
  const currentVersions = codeBlocks.filter(
    (b) => b.source === activeSource && b.language === activeLanguage
  );

  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  // Auto-select first version or null
  const selectedVersion =
    currentVersions.find((v) => v.id === activeVersionId) || currentVersions[0] || null;

  // Track editable buffer
  const [editBuffer, setEditBuffer] = useState('');
  const [editLabel, setEditLabel] = useState('');

  // Top-level tabs (My Solution vs Internet Solution)
  const sourceTabs: TabItem[] = [
    {
      id: 'MY_SOLUTION',
      label: 'My Solution',
      badge: codeBlocks.filter((b) => b.source === 'MY_SOLUTION').length,
    },
    {
      id: 'INTERNET_SOLUTION',
      label: 'Internet Solution',
      badge: codeBlocks.filter((b) => b.source === 'INTERNET_SOLUTION').length,
    },
  ];

  const handleCopy = () => {
    if (!selectedVersion) return;
    navigator.clipboard.writeText(selectedVersion.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    if (!selectedVersion) return;
    const config = SUPPORTED_LANGUAGES[selectedVersion.language];
    const blob = new Blob([selectedVersion.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solution_${selectedVersion.label.replace(/\s+/g, '_').toLowerCase()}${config.extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleStartEdit = () => {
    if (!selectedVersion) return;
    setEditBuffer(selectedVersion.code);
    setEditLabel(selectedVersion.label);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedVersion) return;
    onUpdateVersion({
      ...selectedVersion,
      code: editBuffer,
      label: editLabel.trim() || selectedVersion.label,
    });
    setIsEditing(false);
  };

  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionLabel.trim()) return;
    onAddVersion(
      activeSource,
      activeLanguage,
      newVersionLabel.trim(),
      newVersionCode.trim() || SUPPORTED_LANGUAGES[activeLanguage].defaultBoilerplate
    );
    setNewVersionLabel('');
    setNewVersionCode('');
    setIsAddingVersion(false);
  };

  const codeLines = selectedVersion ? selectedVersion.code.split('\n') : [];
  const fontSizeClass = fontSize === 'xs' ? 'text-xs' : fontSize === 'sm' ? 'text-sm' : 'text-base';
  const lineHClass = fontSize === 'xs' ? 'h-5 leading-5' : fontSize === 'sm' ? 'h-6 leading-6' : 'h-7 leading-7';

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 flex flex-col bg-[var(--color-surface)] w-screen h-screen'
    : 'flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md overflow-hidden relative';

  return (
    <div className={containerClasses}>
      {/* Top level tabs: My Solution vs Internet Solution */}
      <div className="bg-[var(--color-surface-sunken)] px-4 pt-2 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
        <UnderlineTabs
          tabs={sourceTabs}
          activeId={activeSource}
          onChange={(id) => {
            setActiveSource(id as SolutionSource);
            setIsEditing(false);
            setIsAddingVersion(false);
          }}
        />

        <div className="flex items-center gap-2">
          <div className="text-xs text-[var(--color-ink-subtle)] hidden sm:block">
            {activeSource === 'MY_SOLUTION' ? 'Personal implementation' : 'Editorial & patterns'}
          </div>

          {/* Full Screen Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-1.5 rounded transition-colors text-xs flex items-center gap-1.5 ${
              isFullscreen
                ? 'bg-[var(--color-brand)] text-white font-medium shadow-xs'
                : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]'
            }`}
            title={isFullscreen ? 'Exit full screen view (Esc)' : 'Open code in full screen'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={14} />
                <span className="text-[11px]">Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} />
                <span className="text-[11px] hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Language sub-tabs and controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['JAVA', 'CPP', 'PYTHON'] as Language[]).map((lang) => {
            const count = codeBlocks.filter(
              (b) => b.source === activeSource && b.language === lang
            ).length;
            const isSelected = activeLanguage === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  setActiveLanguage(lang);
                  setIsEditing(false);
                  setIsAddingVersion(false);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-semibold border border-[var(--color-brand)]'
                    : 'text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)] border border-transparent'
                }`}
              >
                <span>{SUPPORTED_LANGUAGES[lang].name}</span>
                {count > 0 && (
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-[var(--color-border)] text-[var(--color-ink)]">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action buttons & Editor controls */}
        <div className="flex items-center gap-2">
          {/* Font Size controls in full-screen or regular */}
          <div className="hidden sm:flex items-center gap-1 border border-[var(--color-border)] rounded p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setFontSize('xs')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'xs' ? 'bg-[var(--color-surface-sunken)] font-bold text-[var(--color-brand)]' : 'text-[var(--color-ink-subtle)]'}`}
              title="Small code font"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'sm' ? 'bg-[var(--color-surface-sunken)] font-bold text-[var(--color-brand)]' : 'text-[var(--color-ink-subtle)]'}`}
              title="Medium code font"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('base')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'base' ? 'bg-[var(--color-surface-sunken)] font-bold text-[var(--color-brand)]' : 'text-[var(--color-ink-subtle)]'}`}
              title="Large code font"
            >
              A+
            </button>
          </div>

          {/* Word wrap toggle */}
          <button
            type="button"
            onClick={() => setIsWordWrap(!isWordWrap)}
            className={`p-1.5 rounded text-xs transition-colors border ${
              isWordWrap
                ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border-[var(--color-brand)]'
                : 'border-[var(--color-border)] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
            }`}
            title="Toggle word wrap"
          >
            <WrapText size={14} />
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAddingVersion(true);
              setIsEditing(false);
              setNewVersionCode(SUPPORTED_LANGUAGES[activeLanguage].defaultBoilerplate);
            }}
            icon={<Plus size={14} />}
          >
            Add Version
          </Button>
        </div>
      </div>

      {/* Version selector bar (if multiple versions exist) */}
      {currentVersions.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)] overflow-x-auto shrink-0">
          <span className="text-xs font-medium text-[var(--color-ink-subtle)] shrink-0">
            Versions:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {currentVersions.map((v) => {
              const isSelected = (selectedVersion?.id ?? '') === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setActiveVersionId(v.id);
                    setIsEditing(false);
                  }}
                  className={`text-xs px-2.5 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--color-surface)] text-[var(--color-ink)] font-semibold shadow-xs border border-[var(--color-border)] ring-1 ring-[var(--color-brand)]/20'
                      : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/60'
                  }`}
                >
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content: Add Version Form OR Editor/Viewer */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {isAddingVersion ? (
          <form onSubmit={handleCreateVersion} className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
                <Code2 size={16} className="text-[var(--color-brand)]" />
                Add New {SUPPORTED_LANGUAGES[activeLanguage].name} Version ({activeSource === 'MY_SOLUTION' ? 'My Solution' : 'Internet Solution'})
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingVersion(false)}
                className="text-xs text-[var(--color-ink-subtle)] hover:underline"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
                Version Label (e.g. "Optimal Two Pointers O(N)", "Brute Force", "Attempt 2")
              </label>
              <input
                type="text"
                required
                value={newVersionLabel}
                onChange={(e) => setNewVersionLabel(e.target.value)}
                placeholder="e.g. Optimal Two Pointers"
                className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-[240px]">
              <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
                Code ({SUPPORTED_LANGUAGES[activeLanguage].name})
              </label>
              <textarea
                value={newVersionCode}
                onChange={(e) => setNewVersionCode(e.target.value)}
                rows={16}
                className="w-full flex-1 font-mono text-xs p-3 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
                placeholder="// Paste code here..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 shrink-0">
              <Button size="sm" variant="subtle" type="button" onClick={() => setIsAddingVersion(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Save Version
              </Button>
            </div>
          </form>
        ) : selectedVersion ? (
          <div className="flex flex-col flex-1 h-full min-h-0">
            {/* Toolbar for selected version */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs shrink-0 gap-2">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="px-2 py-0.5 border border-[var(--color-border)] rounded text-xs text-[var(--color-ink)] bg-[var(--color-surface)]"
                  />
                ) : (
                  <span className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
                    {selectedVersion.label}
                  </span>
                )}
                <span className="text-[var(--color-ink-subtle)] text-[11px]">
                  ({codeLines.length} lines) • Updated {new Date(selectedVersion.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={handleCopy}
                  icon={copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>

                <button
                  type="button"
                  onClick={handleDownloadCode}
                  className="p-1.5 text-[var(--color-ink-subtle)] hover:text-[var(--color-brand)] transition-colors rounded hover:bg-[var(--color-surface-sunken)]"
                  title="Download source code file"
                >
                  <Download size={14} />
                </button>

                {isEditing ? (
                  <>
                    <Button size="sm" variant="subtle" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" variant="primary" onClick={handleSaveEdit}>
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={handleStartEdit}
                    icon={<Edit2 size={13} />}
                  >
                    Edit
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onDeleteVersion(selectedVersion.id);
                  }}
                  className="p-1.5 text-[var(--color-ink-subtle)] hover:text-[var(--color-danger)] transition-colors rounded hover:bg-[var(--color-surface-sunken)]"
                  title="Delete version"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Code Body */}
            {isEditing ? (
              <div className="p-3 flex-1 flex flex-col bg-[var(--color-surface-sunken)] min-h-0">
                <textarea
                  value={editBuffer}
                  onChange={(e) => setEditBuffer(e.target.value)}
                  className="w-full flex-1 font-mono text-xs p-3 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] leading-relaxed resize-none"
                  rows={20}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-auto bg-[var(--color-surface-sunken)] p-0 font-mono select-text min-h-0">
                <div className="flex min-w-full">
                  {/* Line numbers */}
                  <div className={`py-3 pl-3 pr-2.5 text-right select-none text-[var(--color-ink-subtle)]/50 border-r border-[var(--color-border)] bg-[var(--color-surface-sunken)] shrink-0 ${fontSizeClass}`}>
                    {codeLines.map((_, i) => (
                      <div key={i} className={lineHClass}>
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Code lines */}
                  <pre
                    className={`py-3 px-4 text-[var(--color-ink)] flex-1 font-mono ${fontSizeClass} ${
                      isWordWrap ? 'whitespace-pre-wrap break-all' : 'overflow-x-auto whitespace-pre'
                    }`}
                  >
                    <code>{selectedVersion.code}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface-sunken)]">
            <Code2 size={36} className="text-[var(--color-ink-subtle)]/50 mb-3" />
            <h4 className="text-sm font-semibold text-[var(--color-ink)] mb-1">
              No {SUPPORTED_LANGUAGES[activeLanguage].name} solution saved
            </h4>
            <p className="text-xs text-[var(--color-ink-subtle)] max-w-sm mb-4">
              Add your {activeSource === 'MY_SOLUTION' ? 'first working solution' : 'favorite online/editorial solution'} for this language.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setIsAddingVersion(true);
                setNewVersionCode(SUPPORTED_LANGUAGES[activeLanguage].defaultBoilerplate);
              }}
              icon={<Plus size={14} />}
            >
              Add {SUPPORTED_LANGUAGES[activeLanguage].name} Code
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
