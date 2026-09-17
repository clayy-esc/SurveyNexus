// A simple toast manager since we don't have external libs.
import React, { useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastContext, ToastData, ToastType } from './ToastContext';

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start p-4 rounded-md shadow-lg border min-w-75 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
              toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400' :
              toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400' :
              'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-400'
            }`}
          >
            <div className="mr-3 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1 text-sm font-medium pr-4">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md opacity-70 hover:bg-black/5 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
