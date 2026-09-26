import React, { useState, useEffect } from 'react';
import { type Sheet } from '../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Trash2 } from 'lucide-react';

interface SheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetToEdit?: Sheet | null;
  onSave: (name: string, description: string) => void;
  onDelete?: (sheetId: string) => void;
}

export function SheetModal({
  isOpen,
  onClose,
  sheetToEdit,
  onSave,
  onDelete,
}: SheetModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (sheetToEdit) {
      setName(sheetToEdit.name);
      setDescription(sheetToEdit.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [sheetToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sheetToEdit ? 'Edit Sheet' : 'Create New Sheet'}
      subtitle="Sheets curate high-level interview prep tracks (e.g. 'Blind 75', 'Amazon Track')."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
            Sheet Name *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. SDE-2 Interview Vault"
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
            placeholder="Optional purpose of this sheet..."
            className="w-full text-xs px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          {sheetToEdit && onDelete ? (
            <Button
              size="sm"
              variant="subtle"
              type="button"
              className="text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => {
                if (confirm(`Delete sheet "${sheetToEdit.name}"? Questions will remain in the vault.`)) {
                  onDelete(sheetToEdit.id);
                  onClose();
                }
              }}
              icon={<Trash2 size={13} />}
            >
              Delete Sheet
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="subtle" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              {sheetToEdit ? 'Save Changes' : 'Create Sheet'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
