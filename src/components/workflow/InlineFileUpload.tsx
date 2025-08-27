'use client';

import React, { useState } from 'react';
import { Application, FileUploadData } from '@/types';
import { Upload, X, File } from 'lucide-react';

interface InlineFileUploadProps {
  application: Application;
  onCancel: () => void;
  onSubmit: (data: FileUploadData) => void;
}

const InlineFileUpload: React.FC<InlineFileUploadProps> = ({
  application,
  onCancel,
  onSubmit
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadType, setUploadType] = useState('');
  const [notes, setNotes] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles && uploadType.trim()) {
      onSubmit({
        files: selectedFiles,
        uploadType: uploadType.trim(),
        notes: notes.trim(),
        applicationId: application.id
      });
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-green-800 flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </h4>
        <button
          onClick={onCancel}
          className="text-green-600 hover:text-green-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-green-700 mb-1">
            Upload Type
          </label>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="">Select upload type...</option>
            <option value="documents">Additional Documents</option>
            <option value="corrections">Document Corrections</option>
            <option value="payment_proof">Payment Proof</option>
            <option value="visa_documents">Visa Documents</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-green-700 mb-1">
            Select Files
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            required
          />
          <p className="text-xs text-green-600 mt-1">
            Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
          </p>
        </div>

        {selectedFiles && (
          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Selected Files
            </label>
            <div className="space-y-1">
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-green-700">
                  <File className="w-4 h-4" />
                  <span>{file.name}</span>
                  <span className="text-green-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-green-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Add any notes about these files..."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            disabled={!selectedFiles || !uploadType.trim()}
          >
            Upload Files
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineFileUpload;