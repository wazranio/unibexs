'use client';

import React, { useState } from 'react';
import { Application, ProgramChangeData } from '@/types';
import { GraduationCap, X } from 'lucide-react';

interface InlineProgramChangeProps {
  application: Application;
  onCancel: () => void;
  onSubmit: (data: ProgramChangeData) => void;
}

const InlineProgramChange: React.FC<InlineProgramChangeProps> = ({
  application,
  onCancel,
  onSubmit
}) => {
  const [newProgram, setNewProgram] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProgram.trim() && reason.trim()) {
      onSubmit({
        newProgram: newProgram.trim(),
        reason: reason.trim(),
        applicationId: application.id
      });
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-blue-800 flex items-center">
          <GraduationCap className="w-4 h-4 mr-2" />
          Suggest Program Change
        </h4>
        <button
          onClick={onCancel}
          className="text-blue-600 hover:text-blue-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Current Program
          </label>
          <input
            type="text"
            value={application.program}
            className="w-full px-3 py-2 border border-blue-300 rounded-md bg-blue-50 text-blue-600"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Suggested New Program
          </label>
          <input
            type="text"
            value={newProgram}
            onChange={(e) => setNewProgram(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter suggested program name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Reason for Change
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Explain why you're suggesting this program change..."
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            disabled={!newProgram.trim() || !reason.trim()}
          >
            Suggest Change
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineProgramChange;