import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'

// Detect if we're running in a native Capacitor environment
const isNative = Capacitor.isNativePlatform()

// Initialize React app immediately
createRoot(document.getElementById("root")!).render(<App />);

// Initialize services asynchronously after React has started
const initializeServices = async () => {
  if (!isNative) {
    // Register service worker for PWA functionality (web only)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
          
          // Dynamic imports to avoid loading web-specific code in native
          const [offlineSyncModule, schedulerModule, notificationsModule] = await Promise.all([
            import('./lib/offlineSync'),
            import('./lib/notificationScheduler'),
            import('./lib/unifiedNotifications')
          ]);
          
          // Initialize offline sync only (notifications handled in App.tsx)
          await offlineSyncModule.offlineSync.init();
          
          // Setup message listener for service worker communication
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'NOTIFICATION_ACTION') {
              // Handle notification actions
              window.dispatchEvent(new CustomEvent('notification-action', {
                detail: {
                  action: event.data.action,
                  data: event.data.notificationData
                }
              }));
            }
          });
        } catch (registrationError) {
          console.log('SW registration failed: ', registrationError);
        }
      });

      // Track user activity for better permission timing
      let lastActivity = Date.now();
      ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
          lastActivity = Date.now();
        }, { passive: true });
      });
    }
  } else {
    // Native environment initialization
    console.log('Running in native Capacitor environment');
    // Notification initialization is handled in App.tsx to avoid conflicts
  }
};

// Start service initialization
initializeServices();