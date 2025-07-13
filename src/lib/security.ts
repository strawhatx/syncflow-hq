/**
 * Security utilities to help protect code from inspection
 */

// Obfuscate function names and strings
export const obfuscateString = (str: string): string => {
  return btoa(str).split('').reverse().join('');
};

export const deobfuscateString = (str: string): string => {
  return atob(str.split('').reverse().join(''));
};

// Create a proxy to hide sensitive objects
export const createSecureProxy = <T extends object>(target: T): T => {
  return new Proxy(target, {
    get(target, prop) {
      // Hide certain properties from inspection
      if (typeof prop === 'string' && prop.startsWith('_')) {
        return undefined;
      }
      return target[prop as keyof T];
    },
    ownKeys(target) {
      // Filter out sensitive keys
      return Object.keys(target).filter(key => !key.startsWith('_'));
    }
  });
};

// Disable right-click context menu
export const disableContextMenu = () => {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
};

// Disable F12, Ctrl+Shift+I, Ctrl+U
export const disableDevTools = () => {
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I (Chrome DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
  });
};

// Detect if dev tools are open
export const detectDevTools = (callback: () => void) => {
  const threshold = 160;
  
  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      callback();
    }
  };
  
  window.addEventListener('resize', checkDevTools);
  setInterval(checkDevTools, 1000);
};

// Obfuscate console methods
export const obfuscateConsole = () => {
  const originalConsole = { ...console };
  
  // Replace console methods with no-ops in production
  if (import.meta.env.PROD) {
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.debug = () => {};
  }
  
  return originalConsole;
};

// Create a secure wrapper for sensitive data
export class SecureData<T> {
  private data: T;
  private key: string;
  
  constructor(data: T, key: string) {
    this.data = data;
    this.key = key;
  }
  
  get(): T {
    return this.data;
  }
  
  set(data: T): void {
    this.data = data;
  }
  
  // Make it harder to inspect
  toString(): string {
    return '[SecureData]';
  }
}

// Initialize security measures
export const initializeSecurity = () => {
  if (import.meta.env.PROD) {
    disableContextMenu();
    disableDevTools();
    obfuscateConsole();
    
    // Optional: Detect dev tools and take action
    // detectDevTools(() => {
    //   console.clear();
    //   document.body.innerHTML = 'Access denied';
    // });
  }
}; 