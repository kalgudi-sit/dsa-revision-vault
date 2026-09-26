import React, { useState, useRef } from 'react';
import { vaultStorage } from '../../../lib/storage';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Download, Upload, RotateCcw, CheckCircle2, AlertTriangle, FileJson, Shield } from 'lucide-react';

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export function BackupExportModal({ isOpen, onClose, onDataRestored }: BackupExportModalProps) {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
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
          setStatusMessage({
            type: 'success',
            text: 'Backup successfully restored! Refreshing vault...',
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
    // Reset input
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
      title="Data Backup, Export & Restore"
      subtitle="Guaranteed Zero Cost & Data Safety: Export your entire vault as JSON anytime."
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
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Section 1: Export */}
        <div className="p-3.5 bg-[var(--color-surface-sunken)] rounded border border-[var(--color-border)] space-y-2">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-[var(--color-brand)]" />
            <h4 className="font-semibold text-sm text-[var(--color-ink)]">
              Download JSON Backup
            </h4>
          </div>
          <p className="text-[var(--color-ink-subtle)] leading-relaxed">
            Downloads your full library including sheets, modules, questions, code versions (Java/C++/Python), and your personal mistake logs in standard JSON.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={handleDownloadBackup}
            icon={<Download size={14} />}
          >
            Export All Vault Data (.json)
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
            Upload a previously exported JSON backup file. All data is validated against the strict Zod backup schema before being saved.
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
            Upload Backup File (.json)
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
