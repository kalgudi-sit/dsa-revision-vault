import React, { useState } from 'react';
import { type Sheet } from '../../sheets/types';
import { type Module } from '../../modules/types';
import { type Question } from '../../questions/types';
import {
  Folder,
  Layers,
  ChevronRight,
  ChevronDown,
  Plus,
  BookmarkCheck,
  Search,
  Database,
  Moon,
  Sun,
  KeyRound,
  FileCode2,
  Trash2,
  Edit2,
  FolderPlus,
  Download,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface AppSidebarProps {
  sheets: Sheet[];
  modules: Module[];
  questions: Question[];
  currentSheetId: string | null;
  currentModuleId: string | null;
  isRevisionQueueActive: boolean;
  onSelectSheet: (sheetId: string | null) => void;
  onSelectModule: (moduleId: string | null) => void;
  onSelectRevisionQueue: () => void;
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  onOpenDataBackup: () => void;
  onCreateSheet: () => void;
  onCreateModule: (sheetId?: string) => void;
  onEditSheet: (sheet: Sheet) => void;
  onDeleteSheet: (sheetId: string) => void;
  onEditModule: (mod: Module) => void;
  onDeleteModule: (moduleId: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAccount: () => void;
  onLogout: () => void;
  onDirectExportBackup: () => void;
}

export function AppSidebar({
  sheets,
  modules,
  questions,
  currentSheetId,
  currentModuleId,
  isRevisionQueueActive,
  onSelectSheet,
  onSelectModule,
  onSelectRevisionQueue,
  onOpenQuickAdd,
  onOpenSearch,
  onOpenDataBackup,
  onCreateSheet,
  onCreateModule,
  onEditSheet,
  onDeleteSheet,
  onEditModule,
  onDeleteModule,
  theme,
  onToggleTheme,
  onOpenAccount,
  onLogout,
  onDirectExportBackup,
}: AppSidebarProps) {
  // Track expanded state of sheets
  const [expandedSheets, setExpandedSheets] = useState<Record<string, boolean>>({
    'sheet-1': true,
    'sheet-2': true,
  });

  const toggleSheetExpand = (sheetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSheets((prev) => ({
      ...prev,
      [sheetId]: !prev[sheetId],
    }));
  };

  const revisionQueueCount = questions.filter((q) => q.status === 'NEEDS_REVISION').length;

  return (
    <aside className="w-64 sm:w-72 bg-[var(--color-surface-sunken)] border-r border-[var(--color-border)] flex flex-col h-full select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => {
            onSelectSheet(null);
            onSelectModule(null);
          }}
        >
          <div className="w-7 h-7 rounded bg-[var(--color-brand)] flex items-center justify-center text-white shadow-xs">
            <FileCode2 size={16} />
          </div>
          <div>
            <h1 className="text-xs font-bold text-[var(--color-ink)] leading-tight tracking-tight">
              DSA Revision Vault
            </h1>
            <span className="text-[10px] text-[var(--color-ink-subtle)]">
              Single-User Edition
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] rounded transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 text-[var(--color-ink-subtle)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface)] rounded transition-colors"
            title="Lock Vault & Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Global Quick Action Buttons */}
      <div className="p-3 border-b border-[var(--color-border)] space-y-2">
        <Button
          size="sm"
          variant="primary"
          className="w-full"
          onClick={onOpenQuickAdd}
          icon={<Plus size={14} />}
        >
          + New Question
        </Button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search size={13} />
            <span>Search Vault...</span>
          </span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Core Quick Views */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onSelectSheet(null);
              onSelectModule(null);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
              !isRevisionQueueActive && currentSheetId === null && currentModuleId === null
                ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-semibold'
                : 'text-[var(--color-ink)] hover:bg-[var(--color-surface)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers size={14} />
              <span>All Questions</span>
            </span>
            <span className="text-[11px] font-mono opacity-80">{questions.length}</span>
          </button>

          <button
            type="button"
            onClick={onSelectRevisionQueue}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
              isRevisionQueueActive
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-semibold'
                : 'text-[var(--color-ink)] hover:bg-[var(--color-surface)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookmarkCheck size={14} className="text-amber-500" />
              <span>Revision Queue</span>
            </span>
            {revisionQueueCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-amber-500 text-white font-bold">
                {revisionQueueCount}
              </span>
            )}
          </button>
        </div>

        {/* Sheets & Modules Tree */}
        <div>
          <div className="flex items-center justify-between px-2.5 py-1 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-ink-subtle)]">
              Curated Sheets
            </span>
            <button
              type="button"
              onClick={onCreateSheet}
              className="p-1 rounded text-[var(--color-ink-subtle)] hover:text-[var(--color-brand)] hover:bg-[var(--color-surface)] transition-colors"
              title="Create new sheet"
            >
              <FolderPlus size={13} />
            </button>
          </div>

          <div className="space-y-1">
            {sheets.map((sheet) => {
              const isExpanded = !!expandedSheets[sheet.id];
              const isSheetSelected =
                !isRevisionQueueActive && currentSheetId === sheet.id && currentModuleId === null;

              // Modules attached to this sheet
              const sheetModules = modules.filter((m) => m.sheetIds.includes(sheet.id));

              return (
                <div key={sheet.id} className="space-y-0.5">
                  <div
                    onClick={() => {
                      onSelectSheet(sheet.id);
                      onSelectModule(null);
                    }}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                      isSheetSelected
                        ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-semibold'
                        : 'text-[var(--color-ink)] hover:bg-[var(--color-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => toggleSheetExpand(sheet.id, e)}
                        className="p-0.5 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
                      >
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                      <Folder size={14} className="shrink-0 text-[var(--color-brand)] opacity-85" />
                      <span className="truncate">{sheet.name}</span>
                    </div>

                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateModule(sheet.id);
                        }}
                        className="p-1 text-[var(--color-ink-subtle)] hover:text-[var(--color-brand)]"
                        title="Add module to this sheet"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSheet(sheet);
                        }}
                        className="p-1 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
                        title="Edit sheet"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Nested Modules list */}
                  {isExpanded && (
                    <div className="pl-6 space-y-0.5 border-l border-[var(--color-border)] ml-3">
                      {sheetModules.map((mod) => {
                        const isModSelected =
                          !isRevisionQueueActive && currentModuleId === mod.id;
                        const modQuestions = questions.filter((q) =>
                          q.moduleIds.includes(mod.id)
                        );

                        return (
                          <div
                            key={mod.id}
                            onClick={() => {
                              onSelectSheet(sheet.id);
                              onSelectModule(mod.id);
                            }}
                            className={`group flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                              isModSelected
                                ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-semibold'
                                : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]'
                            }`}
                          >
                            <span className="truncate">{mod.name}</span>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono opacity-60">
                                {modQuestions.length}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditModule(mod);
                                }}
                                className="hidden group-hover:inline p-0.5 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
                                title="Edit module"
                              >
                                <Edit2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {sheetModules.length === 0 && (
                        <div className="px-2 py-1 text-[11px] text-[var(--color-ink-subtle)] italic">
                          No modules yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Utility & Account Bar */}
      <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
        {/* Quick 1-click JSON Export Button */}
        <button
          type="button"
          onClick={onDirectExportBackup}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-medium hover:bg-[var(--color-brand)] hover:text-white transition-colors"
          title="Download latest JSON backup immediately"
        >
          <span className="flex items-center gap-2">
            <Download size={13} />
            <span>Export Backup (.json)</span>
          </span>
          <span className="text-[10px] font-mono">1-Click</span>
        </button>

        <button
          type="button"
          onClick={onOpenDataBackup}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Database size={13} className="text-[var(--color-brand)]" />
            <span>Restore & Data Tools</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            Saved
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenAccount}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)] transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-full bg-[var(--color-brand)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              AK
            </div>
            <div className="truncate text-left">
              <div className="text-xs font-semibold truncate leading-tight">Abhishek Kalgudi</div>
              <div className="text-[10px] text-[var(--color-ink-subtle)] truncate">
                abhishekkalgudi03@gmail.com
              </div>
            </div>
          </div>
          <KeyRound size={13} className="text-[var(--color-ink-subtle)] shrink-0" />
        </button>
      </div>
    </aside>
  );
}
