// PWA utility functions
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              if (confirm('New version available! Refresh to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.log('Service Worker not supported');
    return null;
  }
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      console.log('Service Workers unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });
  }
};

export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

export const isOnline = () => {
  return navigator.onLine;
};

export const addOnlineListener = (callback: () => void) => {
  window.addEventListener('online', callback);
};

export const addOfflineListener = (callback: () => void) => {
  window.addEventListener('offline', callback);
};

export const removeOnlineListener = (callback: () => void) => {
  window.removeEventListener('online', callback);
};

export const removeOfflineListener = (callback: () => void) => {
  window.removeEventListener('offline', callback);
};

// Background sync (if supported)
export const registerBackgroundSync = async (tag: string) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
};

// Periodic background sync (if supported)
export const registerPeriodicSync = async (tag: string, minInterval: number) => {
  if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).periodicSync.register(tag, {
        minInterval: minInterval
      });
      console.log('Periodic sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Periodic sync registration failed:', error);
      return false;
    }
  }
  return false;
};

// Cache management
export const clearCache = async (cacheName?: string) => {
  if ('caches' in window) {
    try {
      if (cacheName) {
        await caches.delete(cacheName);
        console.log('Cache cleared:', cacheName);
      } else {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('All caches cleared');
      }
      return true;
    } catch (error) {
      console.error('Cache clearing failed:', error);
      return false;
    }
  }
  return false;
};

export const getCacheSize = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Cache size calculation failed:', error);
      return 0;
    }
  }
  return 0;
};

// Install prompt management
export const getInstallPrompt = () => {
  return new Promise<Event | null>((resolve) => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      resolve(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Clean up listener after 10 seconds
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      resolve(null);
    }, 10000);
  });
};

// PWA installation
export const installPWA = async () => {
  const prompt = await getInstallPrompt();
  if (prompt) {
    (prompt as any).prompt();
    const { outcome } = await (prompt as any).userChoice;
    return outcome === 'accepted';
  }
  return false;
};

// Device capabilities detection
export const getDeviceCapabilities = () => {
  return {
    hasServiceWorker: 'serviceWorker' in navigator,
    hasNotifications: 'Notification' in window,
    hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    hasPeriodicSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
    hasPushManager: 'PushManager' in window,
    hasCaches: 'caches' in window,
    hasIndexedDB: 'indexedDB' in window,
    hasWebAppManifest: 'onbeforeinstallprompt' in window,
    isPWA: isPWAInstalled(),
    isOnline: isOnline()
  };
};

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  requestNotificationPermission,
  showNotification,
  isPWAInstalled,
  isOnline,
  addOnlineListener,
  addOfflineListener,
  removeOnlineListener,
  removeOfflineListener,
  registerBackgroundSync,
  registerPeriodicSync,
  clearCache,
  getCacheSize,
  getInstallPrompt,
  installPWA,
  getDeviceCapabilities
};

















