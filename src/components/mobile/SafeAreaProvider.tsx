import React, { createContext, useContext, ReactNode } from 'react';
import { useSafeArea, SafeAreaInsets } from '@/hooks/useSafeArea';

interface SafeAreaContextType {
  safeArea: SafeAreaInsets;
  keyboardHeight: number;
  isNative: boolean;
}

const SafeAreaContext = createContext<SafeAreaContextType | undefined>(undefined);

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  const safeAreaData = useSafeArea();

  return (
    <SafeAreaContext.Provider value={safeAreaData}>
      {children}
    </SafeAreaContext.Provider>
  );
}

export function useSafeAreaContext() {
  const context = useContext(SafeAreaContext);
  if (context === undefined) {
    throw new Error('useSafeAreaContext must be used within a SafeAreaProvider');
  }
  return context;
}