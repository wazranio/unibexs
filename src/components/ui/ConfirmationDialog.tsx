'use client';

import React from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  details?: {
    label: string;
    value: string;
  }[];
  reason?: string;
  isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  details = [],
  reason,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          buttonColor: 'bg-green-600 hover:bg-green-700',
        };
      case 'error':
        return {
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'info':
        return {
          icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
      default: // warning
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {config.icon}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
            
            {/* Details */}
            {details.length > 0 && (
              <div className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                {details.map((detail, index) => (
                  <div key={index} className="flex justify-between items-start py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{detail.label}:</span>
                    <span className={`text-sm ml-2 ${config.textColor} text-right flex-1`}>
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Reason */}
            {reason && (
              <div className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Reason:</p>
                <p className={`text-sm ${config.textColor}`}>{reason}</p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors ${config.buttonColor}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                  Processing...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;