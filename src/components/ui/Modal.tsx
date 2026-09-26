import React, { useEffect } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  showFullscreenToggle?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showFullscreenToggle = false,
  isFullscreen = false,
  onToggleFullscreen,
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
    full: 'max-w-6xl',
  };

  const containerStyle = isFullscreen
    ? 'fixed inset-0 z-50 w-full h-full rounded-none border-0 max-h-screen'
    : `relative w-full ${maxWidthMap[maxWidth]} bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl overflow-hidden z-10 flex flex-col max-h-[92vh]`;

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 flex flex-col bg-[var(--color-surface)]' : 'fixed inset-0 z-50 flex items-center justify-center p-4'}>
      {/* Backdrop */}
      {!isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Dialog card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`${containerStyle} flex flex-col bg-[var(--color-surface)]`}
      >
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] shrink-0">
          <div className="min-w-0 pr-3">
            <h2 id="modal-title" className="text-sm sm:text-base font-semibold text-[var(--color-ink)] truncate">
              {title}
            </h2>
            {subtitle && (
              <div className="text-xs text-[var(--color-ink-subtle)] mt-0.5">{subtitle}</div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {showFullscreenToggle && onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="p-1.5 rounded text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)] transition-colors"
                title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
                aria-label={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </div>
  );
}
