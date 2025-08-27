'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { Application, DocumentRequestData } from '@/types';
import { Upload, X } from 'lucide-react';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/components/ui/Toast';

interface InlineDocumentRequestProps {
  application: Application;
  isAdmin: boolean;
  onCancel: () => void;
  onSubmit: (data: DocumentRequestData) => void;
}

const InlineDocumentRequest: React.FC<InlineDocumentRequestProps> = ({
  application,
  isAdmin: _isAdmin,
  onCancel,
  onSubmit
}) => {
  const [documentType, setDocumentType] = useState('');
  const [reason, setReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentType.trim() && reason.trim()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        documentType: documentType.trim(),
        reason: reason.trim(),
        applicationId: application.id
      });
      setShowConfirmation(false);
      
      // Show success toast
      showToast({
        type: 'success',
        title: 'Document Request Created!',
        message: `Request for ${documentType.replace('_', ' ').toUpperCase()} has been sent to the partner.`
      });
    } catch (error) {
      console.error('Error submitting document request:', error);
      showToast({
        type: 'error',
        title: 'Request Failed',
        message: 'Failed to create document request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-white flex items-center">
          <Upload className="w-4 h-4 mr-2 text-blue-400" />
          Request Additional Documents
        </h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select document type...</option>
            <option value="passport">Passport Copy</option>
            <option value="academic_transcripts">Academic Transcripts</option>
            <option value="english_proficiency">English Proficiency Test</option>
            <option value="financial_documents">Financial Documents</option>
            <option value="personal_statement">Personal Statement</option>
            <option value="recommendation_letters">Recommendation Letters</option>
            <option value="bank_statements">Bank Statements</option>
            <option value="medical_certificate">Medical Certificate</option>
            <option value="police_clearance">Police Clearance Certificate</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Reason for Request
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Explain why this document is needed..."
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!documentType.trim() || !reason.trim() || isSubmitting}
          >
            {isSubmitting ? 'Creating Request...' : 'Request Document'}
          </button>
        </div>
      </form>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmSubmit}
        title="Confirm Document Request"
        message="Are you sure you want to request this document from the partner?"
        confirmText="Send Request"
        cancelText="Cancel"
        type="info"
        details={[
          {
            label: 'Document Type',
            value: documentType.replace('_', ' ').toUpperCase()
          },
          {
            label: 'Application ID',
            value: application.id
          }
        ]}
        reason={reason}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default InlineDocumentRequest;