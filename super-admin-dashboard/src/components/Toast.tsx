import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Global toast function for use outside components
let globalToastFunction: ((message: string, type: 'success' | 'error' | 'info') => void) | null = null;

export const toast = {
  success: (message: string) => {
    if (globalToastFunction) {
      globalToastFunction(message, 'success');
    } else {
      console.log('Success:', message);
    }
  },
  error: (message: string) => {
    if (globalToastFunction) {
      globalToastFunction(message, 'error');
    } else {
      console.log('Error:', message);
    }
  },
  info: (message: string) => {
    if (globalToastFunction) {
      globalToastFunction(message, 'info');
    } else {
      console.log('Info:', message);
    }
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  }, []);

  // Set global function
  React.useEffect(() => {
    globalToastFunction = addToast;
    return () => {
      globalToastFunction = null;
    };
  }, [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${
            toast.type === 'success' ? 'border-l-4 border-green-400' :
            toast.type === 'error' ? 'border-l-4 border-red-400' :
            'border-l-4 border-blue-400'
          }`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <div className="h-6 w-6 text-green-400">✓</div>
                )}
                {toast.type === 'error' && (
                  <div className="h-6 w-6 text-red-400">✗</div>
                )}
                {toast.type === 'info' && (
                  <div className="h-6 w-6 text-blue-400">ℹ</div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {toast.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => onRemove(toast.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
