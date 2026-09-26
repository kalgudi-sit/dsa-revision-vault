import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${maxWidthMap[maxWidth]} bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl overflow-hidden z-10 flex flex-col max-h-[90vh]`}
      >
        <div className="flex items-start justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-[var(--color-ink)]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[var(--color-ink-subtle)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
