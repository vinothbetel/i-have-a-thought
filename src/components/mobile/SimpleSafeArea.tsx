import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
}

export function SafeArea({ children, className }: SafeAreaProps) {
  return (
    <div className={cn('pt-safe pb-safe pl-safe pr-safe', className)}>
      {children}
    </div>
  );
}

// Hook for safe area values (simplified)
export function useMobileSafeArea() {
  return {
    paddingTop: 'var(--safe-area-inset-top)',
    paddingBottom: 'var(--safe-area-inset-bottom)', 
    paddingLeft: 'var(--safe-area-inset-left)',
    paddingRight: 'var(--safe-area-inset-right)',
  };
}