import React from 'react';

export type ButtonVariant = 'primary' | 'subtle' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-hover)] border border-transparent',
    subtle:
      'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)] active:bg-[var(--color-border)] border border-transparent',
    outline:
      'bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-surface-sunken)]',
    danger:
      'bg-[var(--color-danger)] text-white hover:opacity-90 active:opacity-100 border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
