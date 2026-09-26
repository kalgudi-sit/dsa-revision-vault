import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Download, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { vaultStorage } from '../../../lib/storage';

interface CloseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClose: () => void;
}

export function CloseConfirmationModal({
  isOpen,
  onClose,
  onConfirmClose,
}: CloseConfirmationModalProps) {
  if (!isOpen) return null;

  const handleExportNow = () => {
    try {
      const backup = vaultStorage.exportBackup();
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dsa_vault_safety_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export backup', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border-2 border-amber-400 dark:border-amber-600 rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[var(--color-ink)] leading-snug">
              Have you exported your vault data?
            </h3>
            <p className="text-xs text-[var(--color-ink-subtle)] mt-1 leading-relaxed">
              If your browser cache or session is cleared, un-exported changes will be lost. Always keep a downloaded copy of your JSON vault.
            </p>
          </div>
        </div>

        {/* Highlighted Export CTA Button */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <span className="font-semibold">Recommended Safety Action:</span>
            <span className="text-[11px] font-mono">1-click JSON</span>
          </div>
          <Button
            size="md"
            variant="primary"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center justify-center gap-2"
            onClick={handleExportNow}
            icon={<Download size={16} />}
          >
            Export JSON Backup Now
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs">
          <Button size="sm" variant="subtle" onClick={onClose}>
            Stay on Page
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onConfirmClose}
            className="text-[var(--color-ink-subtle)] hover:text-[var(--color-danger)]"
          >
            I Already Exported, Proceed
          </Button>
        </div>
      </div>
    </div>
  );
}
