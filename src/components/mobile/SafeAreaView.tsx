import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useSafeAreaContext } from './SafeAreaProvider';

interface SafeAreaViewProps {
  children: ReactNode;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  className?: string;
  style?: React.CSSProperties;
  mode?: 'padding' | 'margin';
}

export function SafeAreaView({ 
  children, 
  edges = ['top', 'bottom', 'left', 'right'], 
  className, 
  style = {},
  mode = 'padding'
}: SafeAreaViewProps) {
  const { safeArea, isNative } = useSafeAreaContext();

  const safeAreaStyles = isNative ? {
    [mode === 'padding' ? 'paddingTop' : 'marginTop']: edges.includes('top') ? `${safeArea.top}px` : '0px',
    [mode === 'padding' ? 'paddingBottom' : 'marginBottom']: edges.includes('bottom') ? `${safeArea.bottom}px` : '0px',
    [mode === 'padding' ? 'paddingLeft' : 'marginLeft']: edges.includes('left') ? `${safeArea.left}px` : '0px',
    [mode === 'padding' ? 'paddingRight' : 'marginRight']: edges.includes('right') ? `${safeArea.right}px` : '0px',
  } : {};

  return (
    <div 
      className={cn('safe-area-view', className)}
      style={{ ...safeAreaStyles, ...style }}
    >
      {children}
    </div>
  );
}