'use client';

import React, { useState } from 'react';
import { Application } from '@/types';
import { X, FileText, Send } from 'lucide-react';

interface CreateDocumentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentRequestData) => void;
  application: Application;
}

interface DocumentRequestData {
  documentType: string;
  description: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

const CreateDocumentRequestModal: React.FC<CreateDocumentRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  application
}) => {
  const [formData, setFormData] = useState<DocumentRequestData>({
    documentType: '',
    description: '',
    deadline: '',
    priority: 'medium',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const documentTypes = [
    { value: 'passport', label: 'Passport Copy' },
    { value: 'academic_transcripts', label: 'Academic Transcripts' },
    { value: 'english_proficiency', label: 'English Proficiency Test' },
    { value: 'financial_documents', label: 'Financial Documents' },
    { value: 'personal_statement', label: 'Personal Statement' },
    { value: 'recommendation_letters', label: 'Recommendation Letters' },
    { value: 'medical_certificate', label: 'Medical Certificate' },
    { value: 'police_clearance', label: 'Police Clearance Certificate' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'other', label: 'Other Documents' }
  ];

  const handleInputChange = (field: keyof DocumentRequestData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.documentType.trim()) {
      newErrors.documentType = 'Document type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const requestData = {
        ...formData,
        applicationId: application.id,
        requestedAt: new Date().toISOString()
      };
      onSubmit(requestData);
      onClose();
      
      // Reset form
      setFormData({
        documentType: '',
        description: '',
        deadline: '',
        priority: 'medium',
        notes: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Request Document
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Student:</strong> {application.studentName}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Application:</strong> {application.program}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => handleInputChange('documentType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.documentType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select document type...</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.documentType && (
              <p className="text-red-500 text-xs mt-1">{errors.documentType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe what specific document is needed and any requirements..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.deadline ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.deadline && (
              <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional instructions or notes for the partner..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDocumentRequestModal;