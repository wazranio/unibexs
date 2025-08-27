'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastProps {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  autoClose?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  autoClose = true,
  position = 'bottom-right',
}) => {
  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-700 dark:text-green-300',
          titleColor: 'text-green-900 dark:text-green-100',
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-700 dark:text-red-300',
          titleColor: 'text-red-900 dark:text-red-100',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          titleColor: 'text-yellow-900 dark:text-yellow-100',
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-700 dark:text-blue-300',
          titleColor: 'text-blue-900 dark:text-blue-100',
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'top-left':
        return 'fixed top-4 left-4 z-50';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-50';
      case 'top-center':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
      case 'bottom-center':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50';
    }
  };

  const config = getTypeConfig();

  return (
    <div className={`${getPositionClasses()} max-w-md w-full`}>
      <div
        className={`
          ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4
          transform transition-all duration-300 ease-in-out
          animate-in slide-in-from-right-full
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="ml-3 flex-1">
            <h4 className={`text-sm font-semibold ${config.titleColor}`}>
              {title}
            </h4>
            {message && (
              <p className={`text-sm mt-1 ${config.textColor}`}>
                {message}
              </p>
            )}
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className={`ml-4 flex-shrink-0 ${config.textColor} hover:text-gray-800 dark:hover:text-gray-200 transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Progress bar for auto-close */}
        {autoClose && duration > 0 && (
          <div className="mt-3 w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all ${
                type === 'success' ? 'bg-green-500' :
                type === 'error' ? 'bg-red-500' :
                type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{
                animation: `toast-progress ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Toast Manager Context and Hook
export interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'onClose'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const ToastContext = React.createContext<ToastContextType | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultPosition?: ToastProps['position'];
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5,
  defaultPosition = 'bottom-right'
}) => {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

  const showToast = React.useCallback((toast: Omit<ToastProps, 'onClose'>) => {
    const id = toast.id || `toast-${Date.now()}-${Math.random()}`;
    const newToast = {
      ...toast,
      id,
      position: toast.position || defaultPosition,
    };

    setToasts(current => {
      const updated = [...current, newToast];
      // Keep only the most recent toasts
      return updated.slice(-maxToasts);
    });
  }, [maxToasts, defaultPosition]);

  const hideToast = React.useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = React.useMemo(() => ({
    showToast,
    hideToast,
    clearAllToasts,
  }), [showToast, hideToast, clearAllToasts]);

  // Group toasts by position
  const toastsByPosition = React.useMemo(() => {
    const groups: Record<string, (ToastProps & { id: string })[]> = {};
    toasts.forEach(toast => {
      const position = toast.position || defaultPosition;
      if (!groups[position]) {
        groups[position] = [];
      }
      groups[position].push(toast);
    });
    return groups;
  }, [toasts, defaultPosition]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Render toasts grouped by position */}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div key={position}>
          {positionToasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => hideToast(toast.id)}
            />
          ))}
        </div>
      ))}
      
      {/* Global styles for toast animations */}
      <style jsx global>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast;