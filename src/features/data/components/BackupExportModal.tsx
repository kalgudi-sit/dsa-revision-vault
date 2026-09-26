import React, { useState, useRef } from 'react';
import { vaultStorage } from '../../../lib/storage';
import { vaultApi, type GitSyncResult } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import {
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export function BackupExportModal({ isOpen, onClose, onDataRestored }: BackupExportModalProps) {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isGitSyncing, setIsGitSyncing] = useState(false);
  const [gitSyncResult, setGitSyncResult] = useState<GitSyncResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = () => {
    try {
      const backup = vaultStorage.exportBackup();
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dsa_revision_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `Export complete! Downloaded ${backup.questions.length} questions, ${backup.modules.length} modules, and ${backup.sheets.length} sheets.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to create backup download file.',
      });
    }
  };

  const handleSyncWithGit = async () => {
    setIsGitSyncing(true);
    setStatusMessage(null);
    try {
      const currentBackup = vaultStorage.exportBackup();
      const result = await vaultApi.syncParentJsonWithGit(currentBackup);
      setGitSyncResult(result);

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Parent JSON updated in codebase (src/data/vault-data.json) & synced with Git! Commit: ${result.commitSha}`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to update parent JSON and sync with git.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error executing git sync script.',
      });
    } finally {
      setIsGitSyncing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string;
        const parsedJson = JSON.parse(rawContent);
        const result = vaultStorage.importBackup(parsedJson);

        if (!result.success) {
          setStatusMessage({
            type: 'error',
            text: result.error || 'Failed to import backup.',
          });
        } else {
          // Also sync new imported state to codebase parent JSON
          await vaultApi.updateParentVaultData(parsedJson);
          setStatusMessage({
            type: 'success',
            text: 'Backup successfully restored and saved to codebase parent JSON! Refreshing vault...',
          });
          onDataRestored();
        }
      } catch (err) {
        setStatusMessage({
          type: 'error',
          text: 'Invalid JSON file format. Please upload a valid vault backup.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetStarter = () => {
    if (confirm('Reset vault back to the default curated starter data (Striver TUF & Blind 75)?')) {
      vaultStorage.resetToInitialSample();
      setStatusMessage({
        type: 'success',
        text: 'Vault restored to curated starter problem set!',
      });
      onDataRestored();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Parent JSON & Data Repository Sync"
      subtitle="Guaranteed Zero Cost & Data Safety: Update parent JSON in the codebase or export anytime."
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {statusMessage && (
          <div
            className={`p-3 rounded flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Section: Codebase Parent JSON & Git Sync */}
        <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 size={16} className="text-[var(--color-brand)]" />
              <h4 className="font-semibold text-sm text-[var(--color-ink)]">
                Update Parent JSON & Git Repo
              </h4>
            </div>
            {gitSyncResult?.commitSha && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold">
                SHA: {gitSyncResult.commitSha}
              </span>
            )}
          </div>
          <p className="text-[var(--color-ink-subtle)] leading-relaxed">
            Directly updates the repository parent JSON (<code className="text-[11px] font-mono">src/data/vault-data.json</code>) using automatic git commit. On every page refresh, this latest parent JSON is picked up automatically!
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="primary"
              onClick={handleSyncWithGit}
              disabled={isGitSyncing}
              icon={<GitBranch size={14} />}
            >
              {isGitSyncing ? 'Syncing with Git...' : 'Update Parent JSON & Commit to Git'}
            </Button>
            {gitSyncResult && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Synced</span>
              </span>
            )}
          </div>
        </div>

        {/* Section 1: Export */}
        <div className="p-3.5 bg-[var(--color-surface-sunken)] rounded border border-[var(--color-border)] space-y-2">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-[var(--color-brand)]" />
            <h4 className="font-semibold text-sm text-[var(--color-ink)]">
              Download Offline Backup (.json)
            </h4>
          </div>
          <p className="text-[var(--color-ink-subtle)] leading-relaxed">
            Downloads a snapshot of all sheets, modules, questions, code versions, and your personal mistake logs in standard JSON to keep in your downloads folder.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadBackup}
            icon={<Download size={14} />}
          >
            Download Backup File (.json)
          </Button>
        </div>

        {/* Section 2: Import */}
        <div className="p-3.5 bg-[var(--color-surface-sunken)] rounded border border-[var(--color-border)] space-y-2">
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-[var(--color-brand)]" />
            <h4 className="font-semibold text-sm text-[var(--color-ink)]">
              Restore / Migrate from Backup JSON
            </h4>
          </div>
          <p className="text-[var(--color-ink-subtle)] leading-relaxed">
            Upload a previously exported JSON backup file. All data is validated against the strict Zod backup schema and written to the parent JSON.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload size={14} />}
          >
            Upload & Restore File (.json)
          </Button>
        </div>

        {/* Section 3: Reset to sample */}
        <div className="p-3.5 bg-[var(--color-surface-sunken)] rounded border border-[var(--color-border)] flex items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-xs text-[var(--color-ink)] flex items-center gap-1.5">
              <RotateCcw size={13} className="text-zinc-500" />
              Reset to Curated Starter Data
            </h4>
            <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">
              Re-populate with Striver TUF & Blind 75 starter problems and multi-language solutions.
            </p>
          </div>
          <Button size="sm" variant="subtle" onClick={handleResetStarter}>
            Reset
          </Button>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="sm" variant="subtle" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
