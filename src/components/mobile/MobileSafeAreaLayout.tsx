import React from 'react';
import { SafeAreaView } from './SafeAreaView';
import { useSafeAreaContext } from './SafeAreaProvider';
import { cn } from '@/lib/utils';

interface MobileSafeAreaLayoutProps {
  children: React.ReactNode;
  className?: string;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

export function MobileSafeAreaLayout({ 
  children, 
  className, 
  edges = ['top', 'bottom', 'left', 'right']
}: MobileSafeAreaLayoutProps) {
  const { isNative } = useSafeAreaContext();

  return (
    <div 
      className={cn(
        'min-h-screen w-full',
        isNative && 'safe-area-layout',
        className
      )}
    >
      <SafeAreaView edges={edges}>
        {children}
      </SafeAreaView>
    </div>
  );
}

// Update floating elements to respect safe areas
export function FloatingSafeAreaContainer({ 
  children, 
  position = 'bottom-right',
  className 
}: {
  children: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center';
  className?: string;
}) {
  const { safeArea, isNative } = useSafeAreaContext();

  const getPositionStyles = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 50,
    };

    const safeOffset = isNative ? {
      bottom: position.includes('bottom') ? `${safeArea.bottom + 24}px` : undefined,
      top: position.includes('top') ? `${safeArea.top + 24}px` : undefined,
      left: position.includes('left') ? `${safeArea.left + 24}px` : undefined,
      right: position.includes('right') ? `${safeArea.right + 24}px` : undefined,
    } : {
      bottom: position.includes('bottom') ? '24px' : undefined,
      top: position.includes('top') ? '24px' : undefined,
      left: position.includes('left') ? '24px' : undefined,
      right: position.includes('right') ? '24px' : undefined,
    };

    if (position === 'bottom-center') {
      return {
        ...base,
        bottom: isNative ? `${safeArea.bottom + 24}px` : '24px',
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }

    return { ...base, ...safeOffset };
  };

  return (
    <div 
      style={getPositionStyles()}
      className={cn(className)}
    >
      {children}
    </div>
  );
}