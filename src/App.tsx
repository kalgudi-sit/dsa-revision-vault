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
import { vaultApi, type GitSyncResult } from './lib/api';

import { AppSidebar } from './features/navigation/components/AppSidebar';
import { QuestionListView } from './features/questions/components/QuestionListView';
import { QuestionDetailView } from './features/questions/components/QuestionDetailView';
import { RevisionQueueView } from './features/questions/components/RevisionQueueView';
import { AddQuestionPage } from './features/questions/components/AddQuestionPage';
import { GlobalSearchModal } from './features/search/components/GlobalSearchModal';
import { BackupExportModal } from './features/data/components/BackupExportModal';
import { CloseConfirmationModal } from './features/data/components/CloseConfirmationModal';
import { AccountAuthModal } from './features/auth/components/AccountAuthModal';
import { LoginScreen } from './features/auth/components/LoginScreen';
import { SheetModal } from './features/sheets/components/SheetModal';
import { ModuleModal } from './features/modules/components/ModuleModal';

import {
  ChevronRight,
  ArrowLeft,
  Search,
  Plus,
  Menu,
  Download,
  AlertTriangle,
  GitBranch,
  CheckCircle2,
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
  const [isAddQuestionPageOpen, setIsAddQuestionPageOpen] = useState<boolean>(false);

  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isClosePromptOpen, setIsClosePromptOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; icon?: 'download' | 'git' } | null>(null);
  const [isGitSyncing, setIsGitSyncing] = useState(false);

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

  // Refresh all state and sync parent JSON
  const refreshAllData = useCallback(() => {
    setSheets(sheetService.getAllSheets());
    setModules(moduleService.getAllModules());
    setQuestions(questionService.getAllQuestions());
  }, []);

  // Sync to parent JSON helper
  const syncToParentJson = useCallback(() => {
    try {
      const backup = vaultStorage.exportBackup();
      vaultApi.updateParentVaultData(backup);
    } catch (e) {
      console.warn('Auto-sync to parent JSON warning:', e);
    }
  }, []);

  // Fetch Parent JSON on Mount so latest parent JSON from codebase is picked up!
  useEffect(() => {
    vaultApi.getParentVaultData().then((parentData) => {
      if (parentData && Array.isArray(parentData.questions) && parentData.questions.length > 0) {
        vaultStorage.importBackup(parentData);
        refreshAllData();
      }
    });
  }, [refreshAllData]);

  // Browser Window Unload Confirmation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message =
        'Have you exported your vault backup JSON? Any un-exported changes may be lost if browser cache is cleared.';
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Global Keyboard Shortcuts (Cmd+K for search, Cmd+E for quick export, Cmd+N for add question)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleDirectExport();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsAddQuestionPageOpen(true);
        setSelectedQuestionId(null);
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

      setToastMessage({
        text: `Exported ${backup.questions.length} problems & solutions to JSON!`,
        icon: 'download',
      });
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      alert('Failed to export JSON backup.');
    }
  };

  // 1-Click Direct Git Sync of Parent JSON
  const handleDirectGitSync = async () => {
    setIsGitSyncing(true);
    try {
      const currentBackup = vaultStorage.exportBackup();
      const result: GitSyncResult = await vaultApi.syncParentJsonWithGit(currentBackup);
      if (result.success) {
        setToastMessage({
          text: `Parent JSON synced to Git (Commit ${result.commitSha || 'HEAD'})!`,
          icon: 'git',
        });
      } else {
        setToastMessage({
          text: `Saved to disk (Git: ${result.error || 'clean'})`,
          icon: 'git',
        });
      }
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e: any) {
      alert('Git sync error: ' + e.message);
    } finally {
      setIsGitSyncing(false);
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
    return true;
  });

  // Handlers for Question Operations
  const handleSelectQuestion = (q: Question) => {
    const updated = questionService.recordView(q.id);
    if (updated) {
      setQuestions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }
    setIsAddQuestionPageOpen(false);
    setSelectedQuestionId(q.id);
  };

  // Full-page Add Question Handler
  const handleSaveFullQuestion = (input: {
    title: string;
    links: string[];
    difficulty: any;
    status: any;
    tags: string[];
    notes: string;
    sheetIds: string[];
    moduleIds: string[];
    mySolutionCode: string;
    mySolutionLanguage: any;
    optimalSolutionCode: string;
    optimalSolutionLanguage: any;
  }) => {
    const result = questionService.createFullQuestion(input);
    if (result.success) {
      refreshAllData();
      syncToParentJson();
      setIsAddQuestionPageOpen(false);
      handleSelectQuestion(result.data);
      setToastMessage({
        text: `Problem "${result.data.title}" added to Vault!`,
        icon: 'git',
      });
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      alert(result.error);
    }
  };

  const handleUpdateQuestion = (input: UpdateQuestionInput) => {
    const result = questionService.updateQuestion(input);
    if (result.success) {
      refreshAllData();
      syncToParentJson();
    }
  };

  const handleUpdateStatus = (id: string, status: RevisionStatus) => {
    const result = questionService.updateStatus(id, status);
    if (result.success) {
      refreshAllData();
      syncToParentJson();
    }
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    const result = questionService.updateNotes(id, notes);
    if (result.success) {
      refreshAllData();
      syncToParentJson();
    }
  };

  const handleDeleteQuestion = (id: string) => {
    const result = questionService.deleteQuestion(id);
    if (result.success) {
      refreshAllData();
      syncToParentJson();
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
      syncToParentJson();
    }
  };

  const handleUpdateCodeBlock = (block: CodeBlock) => {
    const result = questionService.updateCodeBlock(block);
    if (result.success) {
      refreshAllData();
      syncToParentJson();
    }
  };

  const handleDeleteCodeBlock = (blockId: string) => {
    if (!selectedQuestionId) return;
    const result = questionService.deleteCodeBlock(selectedQuestionId, blockId);
    if (result.success) {
      refreshAllData();
      syncToParentJson();
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
    syncToParentJson();
  };

  const handleDeleteSheet = (id: string) => {
    sheetService.deleteSheet(id);
    if (currentSheetId === id) setCurrentSheetId(null);
    refreshAllData();
    syncToParentJson();
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
    syncToParentJson();
  };

  const handleDeleteModule = (id: string) => {
    moduleService.deleteModule(id);
    if (currentModuleId === id) setCurrentModuleId(null);
    refreshAllData();
    syncToParentJson();
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[var(--color-brand)] text-white px-4 py-2.5 rounded-md shadow-xl text-xs font-semibold flex items-center gap-2 border border-blue-400">
          {toastMessage.icon === 'git' ? <GitBranch size={14} /> : <Download size={14} />}
          <span>{toastMessage.text}</span>
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
            setIsAddQuestionPageOpen(false);
            setIsMobileSidebarOpen(false);
          }}
          onSelectModule={(moduleId) => {
            setCurrentModuleId(moduleId);
            setIsRevisionQueueActive(false);
            setSelectedQuestionId(null);
            setIsAddQuestionPageOpen(false);
            setIsMobileSidebarOpen(false);
          }}
          onSelectRevisionQueue={() => {
            setIsRevisionQueueActive(true);
            setCurrentSheetId(null);
            setCurrentModuleId(null);
            setSelectedQuestionId(null);
            setIsAddQuestionPageOpen(false);
            setIsMobileSidebarOpen(false);
          }}
          onOpenQuickAdd={() => {
            setIsAddQuestionPageOpen(true);
            setSelectedQuestionId(null);
            setIsMobileSidebarOpen(false);
          }}
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
        {/* Top Header & Breadcrumb Bar (Uncluttered, serene) */}
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
                  setIsAddQuestionPageOpen(false);
                }}
                className="hover:text-[var(--color-ink)] cursor-pointer truncate font-medium"
              >
                DSA Vault
              </span>

              {isAddQuestionPageOpen && (
                <>
                  <ChevronRight size={13} className="shrink-0 text-[var(--color-ink-subtle)]" />
                  <span className="font-semibold text-[var(--color-brand)] truncate">
                    New Question
                  </span>
                </>
              )}

              {isRevisionQueueActive && !isAddQuestionPageOpen && (
                <>
                  <ChevronRight size={13} className="shrink-0 text-[var(--color-ink-subtle)]" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400 truncate">
                    Revision Queue
                  </span>
                </>
              )}

              {activeSheet && !isAddQuestionPageOpen && (
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

              {activeModule && !isAddQuestionPageOpen && (
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

              {activeQuestion && !isAddQuestionPageOpen && (
                <>
                  <ChevronRight size={13} className="shrink-0 text-[var(--color-ink-subtle)]" />
                  <span className="font-semibold text-[var(--color-ink)] truncate">
                    {activeQuestion.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Header Actions: Clean, Uncluttered (No duplicate +Question button!) */}
          <div className="flex items-center gap-2 shrink-0">
            {(selectedQuestionId || isAddQuestionPageOpen) && (
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  setSelectedQuestionId(null);
                  setIsAddQuestionPageOpen(false);
                }}
                icon={<ArrowLeft size={13} />}
              >
                Back to List
              </Button>
            )}

            {/* Sync Parent JSON to Git Button */}
            <Button
              size="sm"
              variant="subtle"
              onClick={handleDirectGitSync}
              disabled={isGitSyncing}
              className="hidden md:inline-flex text-xs"
              icon={<GitBranch size={13} className="text-[var(--color-brand)]" />}
            >
              {isGitSyncing ? 'Syncing...' : 'Sync Git'}
            </Button>

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
              icon={<Search size={14} />}
            >
              Search (⌘K)
            </Button>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 flex flex-col h-[calc(100vh-3rem)] overflow-hidden">
          {isAddQuestionPageOpen ? (
            <AddQuestionPage
              sheets={sheets}
              modules={modules}
              defaultSheetId={currentSheetId}
              defaultModuleId={currentModuleId}
              onBack={() => setIsAddQuestionPageOpen(false)}
              onSave={handleSaveFullQuestion}
            />
          ) : activeQuestion ? (
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
              onOpenQuickAdd={() => {
                setIsAddQuestionPageOpen(true);
                setSelectedQuestionId(null);
              }}
              onUpdateStatus={handleUpdateStatus}
              onDeleteQuestion={handleDeleteQuestion}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
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
          setIsAddQuestionPageOpen(false);
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
