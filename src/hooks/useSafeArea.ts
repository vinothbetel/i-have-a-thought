import { useEffect, useState } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function useSafeArea() {
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const setupSafeArea = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Configure status bar
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#000000' });
          
          // Get safe area insets from CSS environment variables
          const root = document.documentElement;
          const topInset = parseFloat(getComputedStyle(root).getPropertyValue('env(safe-area-inset-top)').replace('px', '')) || 0;
          const bottomInset = parseFloat(getComputedStyle(root).getPropertyValue('env(safe-area-inset-bottom)').replace('px', '')) || 0;
          const leftInset = parseFloat(getComputedStyle(root).getPropertyValue('env(safe-area-inset-left)').replace('px', '')) || 0;
          const rightInset = parseFloat(getComputedStyle(root).getPropertyValue('env(safe-area-inset-right)').replace('px', '')) || 0;

          setSafeArea({
            top: topInset,
            bottom: bottomInset,
            left: leftInset,
            right: rightInset
          });

          // Set CSS custom properties for safe areas
          root.style.setProperty('--safe-area-inset-top', `${topInset}px`);
          root.style.setProperty('--safe-area-inset-bottom', `${bottomInset}px`);
          root.style.setProperty('--safe-area-inset-left', `${leftInset}px`);
          root.style.setProperty('--safe-area-inset-right', `${rightInset}px`);

        } catch (error) {
          console.warn('Error setting up safe area:', error);
        }
      }
    };

    const setupKeyboardListeners = async () => {
      if (Capacitor.isNativePlatform()) {
        const keyboardShowListener = await Keyboard.addListener('keyboardWillShow', info => {
          setKeyboardHeight(info.keyboardHeight);
        });

        const keyboardHideListener = await Keyboard.addListener('keyboardWillHide', () => {
          setKeyboardHeight(0);
        });

        return () => {
          keyboardShowListener.remove();
          keyboardHideListener.remove();
        };
      }
    };

    setupSafeArea();
    setupKeyboardListeners().then(cleanup => {
      return cleanup;
    });

  }, []);

  return {
    safeArea,
    keyboardHeight,
    isNative: Capacitor.isNativePlatform()
  };
}