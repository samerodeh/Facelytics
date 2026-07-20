import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
}

const variantClass: Record<NonNullable<LoadingButtonProps['variant']>, string> = {
  primary: 'btn-primary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`btn ${variantClass[variant]} ${className}`}
    >
      {isLoading && <Loader2 size={18} className="animate-spin" />}
      <span>{children}</span>
    </button>
  );
};

export default LoadingButton;
