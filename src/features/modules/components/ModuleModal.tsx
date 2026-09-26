import React, { useState, useEffect } from 'react';
import { type Module } from '../types';
import { type Sheet } from '../../sheets/types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Trash2 } from 'lucide-react';

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleToEdit?: Module | null;
  defaultSheetId?: string;
  allSheets: Sheet[];
  onSave: (name: string, description: string, sheetIds: string[]) => void;
  onDelete?: (moduleId: string) => void;
}

export function ModuleModal({
  isOpen,
  onClose,
  moduleToEdit,
  defaultSheetId,
  allSheets,
  onSave,
  onDelete,
}: ModuleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSheetIds, setSelectedSheetIds] = useState<string[]>([]);

  useEffect(() => {
    if (moduleToEdit) {
      setName(moduleToEdit.name);
      setDescription(moduleToEdit.description || '');
      setSelectedSheetIds(moduleToEdit.sheetIds || []);
    } else {
      setName('');
      setDescription('');
      setSelectedSheetIds(defaultSheetId ? [defaultSheetId] : allSheets.map((s) => s.id).slice(0, 1));
    }
  }, [moduleToEdit, defaultSheetId, allSheets, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim(), selectedSheetIds);
    onClose();
  };

  const toggleSheet = (sheetId: string) => {
    if (selectedSheetIds.includes(sheetId)) {
      setSelectedSheetIds(selectedSheetIds.filter((id) => id !== sheetId));
    } else {
      setSelectedSheetIds([...selectedSheetIds, sheetId]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={moduleToEdit ? 'Edit Module / Pattern' : 'Create Module / Pattern'}
      subtitle="Modules organize patterns (e.g. 'Sliding Window', 'Graphs BFS/DFS') across sheets."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
            Module Name *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sliding Window & Two Pointers"
            className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional notes or sub-patterns covered..."
            className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-ink-subtle)] mb-1">
            Belongs to Sheets (reusable across multiple sheets!)
          </label>
          <div className="space-y-1.5 p-2 bg-[var(--color-surface-sunken)] rounded border border-[var(--color-border)]">
            {allSheets.map((sheet) => {
              const isChecked = selectedSheetIds.includes(sheet.id);
              return (
                <label
                  key={sheet.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[var(--color-surface)] p-1 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSheet(sheet.id)}
                    className="rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                  />
                  <span className="text-xs font-medium text-[var(--color-ink)]">{sheet.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          {moduleToEdit && onDelete ? (
            <Button
              size="sm"
              variant="subtle"
              type="button"
              className="text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => {
                if (confirm(`Delete module "${moduleToEdit.name}"? Questions will remain in the vault.`)) {
                  onDelete(moduleToEdit.id);
                  onClose();
                }
              }}
              icon={<Trash2 size={13} />}
            >
              Delete Module
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="subtle" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              {moduleToEdit ? 'Save Changes' : 'Create Module'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
