import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full animate-spin`}
        style={{
          borderColor: 'rgba(255,0,128,0.2)',
          borderTopColor: '#ff0080',
          boxShadow: '0 0 8px #ff0080, 0 0 16px rgba(255,0,128,0.5)',
        }}
      />
    </div>
  );
};
