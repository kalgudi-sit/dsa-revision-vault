import React, { useState, useEffect, useCallback } from 'react';
import { type Sheet } from './features/sheets/types';
import { type Module } from './features/modules/types';
import {
  type Question,
  type QuickAddQuestionInput,
  type UpdateQuestionInput,
  type RevisionStatus,
} from './features/questions/types';
import { type SolutionSource, type Language, type CodeBlock } from './features/code-blocks/types';
import { sheetService } from './features/sheets/service';
import { moduleService } from './features/modules/service';
import { questionService } from './features/questions/service';
import { authService } from './features/auth/service';
import { vaultStorage } from './lib/storage';

import { AppSidebar } from './features/navigation/components/AppSidebar';
import { QuestionListView } from './features/questions/components/QuestionListView';
import { QuestionDetailView } from './features/questions/components/QuestionDetailView';
import { RevisionQueueView } from './features/questions/components/RevisionQueueView';
import { QuickAddModal } from './features/questions/components/QuickAddModal';
import { GlobalSearchModal } from './features/search/components/GlobalSearchModal';
import { BackupExportModal } from './features/data/components/BackupExportModal';
import { CloseConfirmationModal } from './features/data/components/CloseConfirmationModal';
import { AccountAuthModal } from './features/auth/components/AccountAuthModal';
import { LoginScreen } from './features/auth/components/LoginScreen';
import { SheetModal } from './features/sheets/components/SheetModal';
import { ModuleModal } from './features/modules/components/ModuleModal';

import {
  ChevronRight,
  Folder,
  ArrowLeft,
  Search,
  Plus,
  BookmarkCheck,
  Menu,
  Download,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from './components/ui/Button';

export default function App() {
  // Authentication check: Single-user gatekeeper
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authService.getCurrentUser() !== null;
  });

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => vaultStorage.getTheme());

  useEffect(() => {
    vaultStorage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Vault data state
  const [sheets, setSheets] = useState<Sheet[]>(() => sheetService.getAllSheets());
  const [modules, setModules] = useState<Module[]>(() => moduleService.getAllModules());
  const [questions, setQuestions] = useState<Question[]>(() => questionService.getAllQuestions());

  // Active navigation selection
  const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [isRevisionQueueActive, setIsRevisionQueueActive] = useState<boolean>(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isClosePromptOpen, setIsClosePromptOpen] = useState(false);
  const [exportToastMessage, setExportToastMessage] = useState<string | null>(null);

  // Sheet modal state
  const [sheetModalState, setSheetModalState] = useState<{
    isOpen: boolean;
    sheetToEdit: Sheet | null;
  }>({ isOpen: false, sheetToEdit: null });

  // Module modal state
  const [moduleModalState, setModuleModalState] = useState<{
    isOpen: boolean;
    moduleToEdit: Module | null;
    defaultSheetId?: string;
  }>({ isOpen: false, moduleToEdit: null });

  // Refresh all state
  const refreshAllData = useCallback(() => {
    setSheets(sheetService.getAllSheets());
    setModules(moduleService.getAllModules());
    setQuestions(questionService.getAllQuestions());
  }, []);

  // Browser Window Unload Confirmation:
  // "Whenever anyone tries to close it, always prompt user a confirmation if he has exported the json else he will loose changes"
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard browser prompt to confirm leaving un-exported tab
      const message = 'Have you exported your vault backup JSON? Any un-exported changes may be lost if browser cache is cleared.';
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Global Keyboard Shortcuts (Cmd+K for search, Cmd+N for quick add, Cmd+E for quick export)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleDirectExport();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1-Click Direct Backup Export
  const handleDirectExport = () => {
    try {
      const backup = vaultStorage.exportBackup();
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dsa_revision_vault_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportToastMessage(`Exported ${backup.questions.length} problems & solutions to JSON!`);
      setTimeout(() => setExportToastMessage(null), 3500);
    } catch (err) {
      alert('Failed to export JSON backup.');
    }
  };

  // Selected entities
  const activeSheet = sheets.find((s) => s.id === currentSheetId) || null;
  const activeModule = modules.find((m) => m.id === currentModuleId) || null;
  const activeQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

  // Filter questions for the list view
  const currentViewQuestions = questions.filter((q) => {
    if (currentModuleId) {
      return q.moduleIds.includes(currentModuleId);
    }
    if (currentSheetId) {
      return q.sheetIds.includes(currentSheetId);
    }
    return true; // All questions
  });

  // Handlers for Question Operations
  const handleSelectQuestion = (q: Question) => {
    const updated = questionService.recordView(q.id);
    if (updated) {
      setQuestions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }
    setSelectedQuestionId(q.id);
  };

  const handleQuickAddQuestion = (input: QuickAddQuestionInput) => {
    const result = questionService.quickAdd({
      ...input,
      moduleId: input.moduleId || currentModuleId || undefined,
    });
    if (result.success) {
      refreshAllData();
      handleSelectQuestion(result.data);
    }
  };

  const handleUpdateQuestion = (input: UpdateQuestionInput) => {
    const result = questionService.updateQuestion(input);
    if (result.success) {
      refreshAllData();
    }
  };

  const handleUpdateStatus = (id: string, status: RevisionStatus) => {
    const result = questionService.updateStatus(id, status);
    if (result.success) {
      refreshAllData();
    }
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    const result = questionService.updateNotes(id, notes);
    if (result.success) {
      refreshAllData();
    }
  };

  const handleDeleteQuestion = (id: string) => {
    const result = questionService.deleteQuestion(id);
    if (result.success) {
      refreshAllData();
      if (selectedQuestionId === id) {
        setSelectedQuestionId(null);
      }
    }
  };

  const handleAddCodeVersion = (
    source: SolutionSource,
    language: Language,
    label: string,
    code: string
  ) => {
    if (!selectedQuestionId) return;
    const result = questionService.addCodeVersion({
      questionId: selectedQuestionId,
      source,
      language,
      label,
      code,
    });
    if (result.success) {
      refreshAllData();
    }
  };

  const handleUpdateCodeBlock = (block: CodeBlock) => {
    const result = questionService.updateCodeBlock(block);
    if (result.success) {
      refreshAllData();
    }
  };

  const handleDeleteCodeBlock = (blockId: string) => {
    if (!selectedQuestionId) return;
    const result = questionService.deleteCodeBlock(selectedQuestionId, blockId);
    if (result.success) {
      refreshAllData();
    }
  };

  // Handlers for Sheets and Modules
  const handleSaveSheet = (name: string, description: string) => {
    if (sheetModalState.sheetToEdit) {
      sheetService.updateSheet({ id: sheetModalState.sheetToEdit.id, name, description });
    } else {
      sheetService.createSheet({ name, description });
    }
    refreshAllData();
  };

  const handleDeleteSheet = (id: string) => {
    sheetService.deleteSheet(id);
    if (currentSheetId === id) setCurrentSheetId(null);
    refreshAllData();
  };

  const handleSaveModule = (name: string, description: string, sheetIds: string[]) => {
    if (moduleModalState.moduleToEdit) {
      moduleService.updateModule({
        id: moduleModalState.moduleToEdit.id,
        name,
        description,
        sheetIds,
      });
    } else {
      moduleService.createModule({ name, description, sheetIds });
    }
    refreshAllData();
  };

  const handleDeleteModule = (id: string) => {
    moduleService.deleteModule(id);
    if (currentModuleId === id) setCurrentModuleId(null);
    refreshAllData();
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  // If user is not authenticated, display Single-User Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-surface)] text-[var(--color-ink)] relative">
      {/* Toast notification for direct JSON export */}
      {exportToastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[var(--color-brand)] text-white px-4 py-2.5 rounded-md shadow-xl text-xs font-semibold flex items-center gap-2 border border-blue-400">
          <Download size={14} />
          <span>{exportToastMessage}</span>
        </div>
      )}

      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* App Sidebar (fixed desktop, drawer mobile) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AppSidebar
          sheets={sheets}
          modules={modules}
          questions={questions}
          currentSheetId={currentSheetId}
          currentModuleId={currentModuleId}
          isRevisionQueueActive={isRevisionQueueActive}
          onSelectSheet={(sheetId) => {
            setCurrentSheetId(sheetId);
            setCurrentModuleId(null);
            setIsRevisionQueueActive(false);
            setSelectedQuestionId(null);
            setIsMobileSidebarOpen(false);
          }}
          onSelectModule={(moduleId) => {
            setCurrentModuleId(moduleId);
            setIsRevisionQueueActive(false);
            setSelectedQuestionId(null);
            setIsMobileSidebarOpen(false);
          }}
          onSelectRevisionQueue={() => {
            setIsRevisionQueueActive(true);
            setCurrentSheetId(null);
            setCurrentModuleId(null);
            setSelectedQuestionId(null);
            setIsMobileSidebarOpen(false);
          }}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenDataBackup={() => setIsBackupOpen(true)}
          onCreateSheet={() => setSheetModalState({ isOpen: true, sheetToEdit: null })}
          onCreateModule={(sheetId) =>
            setModuleModalState({ isOpen: true, moduleToEdit: null, defaultSheetId: sheetId })
          }
          onEditSheet={(sheet) => setSheetModalState({ isOpen: true, sheetToEdit: sheet })}
          onDeleteSheet={handleDeleteSheet}
          onEditModule={(mod) => setModuleModalState({ isOpen: true, moduleToEdit: mod })}
          onDeleteModule={handleDeleteModule}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenAccount={() => setIsAccountOpen(true)}
          onLogout={handleLogout}
          onDirectExportBackup={handleDirectExport}
        />
      </div>

      {/* Main Workspace Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header & Breadcrumb Bar */}
        <header className="h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[var(--color-ink-subtle)] min-w-0">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1 -ml-1 text-[var(--color-ink)] md:hidden rounded hover:bg-[var(--color-surface-sunken)]"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 truncate">
              <span
                onClick={() => {
                  setCurrentSheetId(null);
                  setCurrentModuleId(null);
                  setIsRevisionQueueActive(false);
                  setSelectedQuestionId(null);
                }}
                className="hover:text-[var(--color-ink)] cursor-pointer truncate font-medium"
              >
                DSA Vault
              </span>

              {isRevisionQueueActive && (
                <>
                  <ChevronRight size={13} className="shrink-0 text-[var(--color-ink-subtle)]" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400 truncate">
                    Revision Queue
                  </span>
                </>
              )}

              {activeSheet && (
                <>
                  <ChevronRight size={13} className="shrink-0 text-[var(--color-ink-subtle)]" />
                  <span
                    onClick={() => {
                      setCurrentModuleId(null);
                      setSelectedQuestionId(null);
                    }}
                    className="hover:text-[var(--color-ink)] cursor-pointer truncate"
                  >
                    {activeSheet.name}
                  </span>
                </>
              )}

              {activeModule && (
                <>
                  <ChevronRight size={13} className="shrink-0 text-[var(--color-ink-subtle)]" />
                  <span
                    onClick={() => setSelectedQuestionId(null)}
                    className="hover:text-[var(--color-ink)] cursor-pointer truncate"
                  >
                    {activeModule.name}
                  </span>
                </>
              )}

              {activeQuestion && (
                <>
                  <ChevronRight size={13} className="shrink-0 text-[var(--color-ink-subtle)]" />
                  <span className="font-semibold text-[var(--color-ink)] truncate">
                    {activeQuestion.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {selectedQuestionId && (
              <Button
                size="sm"
                variant="subtle"
                onClick={() => setSelectedQuestionId(null)}
                icon={<ArrowLeft size={13} />}
              >
                Back to List
              </Button>
            )}

            {/* Safety Backup Check Button */}
            <button
              type="button"
              onClick={() => setIsClosePromptOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 transition-colors"
              title="Verify vault safety status before closing"
            >
              <AlertTriangle size={13} className="text-amber-600" />
              <span>Safety Check</span>
            </button>

            <Button
              size="sm"
              variant="subtle"
              onClick={handleDirectExport}
              className="hidden sm:inline-flex"
              icon={<Download size={13} />}
            >
              Export JSON
            </Button>

            <Button
              size="sm"
              variant="subtle"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:inline-flex"
              icon={<Search size={14} />}
            >
              Search (⌘K)
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsQuickAddOpen(true)}
              icon={<Plus size={14} />}
            >
              + Question
            </Button>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 flex flex-col h-[calc(100vh-3rem)] overflow-hidden">
          {activeQuestion ? (
            <QuestionDetailView
              question={activeQuestion}
              allSheets={sheets}
              allModules={modules}
              onUpdateQuestion={handleUpdateQuestion}
              onUpdateStatus={handleUpdateStatus}
              onUpdateNotes={handleUpdateNotes}
              onDeleteQuestion={handleDeleteQuestion}
              onAddCodeVersion={handleAddCodeVersion}
              onUpdateCodeBlock={handleUpdateCodeBlock}
              onDeleteCodeBlock={handleDeleteCodeBlock}
            />
          ) : isRevisionQueueActive ? (
            <RevisionQueueView
              questions={questions}
              modules={modules}
              onSelectQuestion={handleSelectQuestion}
              onUpdateStatus={handleUpdateStatus}
            />
          ) : (
            <QuestionListView
              questions={currentViewQuestions}
              currentSheet={activeSheet}
              currentModule={activeModule}
              allModules={modules}
              onSelectQuestion={handleSelectQuestion}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onUpdateStatus={handleUpdateStatus}
              onDeleteQuestion={handleDeleteQuestion}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        modules={modules}
        defaultModuleId={currentModuleId || undefined}
        onSave={handleQuickAddQuestion}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        questions={questions}
        modules={modules}
        onSelectQuestion={handleSelectQuestion}
      />

      <BackupExportModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={() => {
          refreshAllData();
          setSelectedQuestionId(null);
        }}
      />

      <CloseConfirmationModal
        isOpen={isClosePromptOpen}
        onClose={() => setIsClosePromptOpen(false)}
        onConfirmClose={() => setIsClosePromptOpen(false)}
      />

      <AccountAuthModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      <SheetModal
        isOpen={sheetModalState.isOpen}
        sheetToEdit={sheetModalState.sheetToEdit}
        onClose={() => setSheetModalState({ isOpen: false, sheetToEdit: null })}
        onSave={handleSaveSheet}
        onDelete={handleDeleteSheet}
      />

      <ModuleModal
        isOpen={moduleModalState.isOpen}
        moduleToEdit={moduleModalState.moduleToEdit}
        defaultSheetId={moduleModalState.defaultSheetId}
        allSheets={sheets}
        onClose={() => setModuleModalState({ isOpen: false, moduleToEdit: null })}
        onSave={handleSaveModule}
        onDelete={handleDeleteModule}
      />
    </div>
  );
}
