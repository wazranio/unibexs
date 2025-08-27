'use client';

import React from 'react';
import { X, Upload, FileText, AlertTriangle, Info } from 'lucide-react';

export interface UploadConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file: File | null;
  documentType: string;
  isUploading?: boolean;
}

const UploadConfirmationDialog: React.FC<UploadConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  file,
  documentType,
  isUploading = false,
}) => {
  if (!isOpen || !file) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    }
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  const isValidFileSize = file.size <= 10 * 1024 * 1024; // 10MB limit
  const validFileTypes = ['pdf', 'jpg', 'jpeg', 'png'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const isValidFileType = validFileTypes.includes(fileExtension);

  const canProceed = isValidFileSize && isValidFileType;

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
              <Upload className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Document Upload
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
            <p className="text-gray-700 dark:text-gray-300">
              You are about to upload a document. This action cannot be undone once submitted.
            </p>
            
            {/* File Details */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                {getFileTypeIcon(file.name)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
                    {file.name}
                  </h4>
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700 dark:text-blue-300">Size:</span>
                      <span className="text-blue-800 dark:text-blue-200 font-medium">{formatFileSize(file.size)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700 dark:text-blue-300">Document Type:</span>
                      <span className="text-blue-800 dark:text-blue-200 font-medium">
                        {documentType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Warnings */}
            {!isValidFileSize && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">File too large</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      Maximum file size is 10MB. Current file is {formatFileSize(file.size)}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isValidFileType && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Invalid file type</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      Please upload PDF, JPG, JPEG, or PNG files only.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* What happens next */}
            {canProceed && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">What happens next?</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Your document will be sent to the admin for review. You will be notified once it has been reviewed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canProceed || isUploading}
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors ${
                canProceed 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadConfirmationDialog;