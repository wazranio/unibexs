'use client';

import React, { useState } from 'react';
import { Application, ProgramDecisionData } from '@/types';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface InlineProgramDecisionProps {
  application: Application;
  suggestedProgram?: string;
  onCancel: () => void;
  onAccept: (data: ProgramDecisionData) => void;
  onReject: (data: ProgramDecisionData) => void;
}

const InlineProgramDecision: React.FC<InlineProgramDecisionProps> = ({
  application,
  suggestedProgram = '',
  onCancel,
  onAccept,
  onReject
}) => {
  const [decision, setDecision] = useState<'accept' | 'reject' | ''>('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decision && reason.trim()) {
      const data = {
        decision,
        reason: reason.trim(),
        suggestedProgram,
        applicationId: application.id
      };

      if (decision === 'accept') {
        onAccept(data);
      } else {
        onReject(data);
      }
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-purple-800">
          Program Change Decision
        </h4>
        <button
          onClick={onCancel}
          className="text-purple-600 hover:text-purple-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4 p-3 bg-purple-100 rounded-lg">
        <p className="text-sm text-purple-700">
          <strong>Current Program:</strong> {application.program}
        </p>
        {suggestedProgram && (
          <p className="text-sm text-purple-700 mt-1">
            <strong>Suggested Program:</strong> {suggestedProgram}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Your Decision
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="decision"
                value="accept"
                checked={decision === 'accept'}
                onChange={(e) => setDecision(e.target.value as 'accept')}
                className="mr-2 text-green-600"
              />
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-purple-700">Accept Program Change</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="decision"
                value="reject"
                checked={decision === 'reject'}
                onChange={(e) => setDecision(e.target.value as 'reject')}
                className="mr-2 text-red-600"
              />
              <XCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-purple-700">Reject Program Change</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">
            Reason for Decision
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            placeholder="Explain your decision..."
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-md hover:bg-purple-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-3 py-2 text-sm font-medium text-white rounded-md ${
              decision === 'accept' 
                ? 'bg-green-600 hover:bg-green-700' 
                : decision === 'reject'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
            disabled={!decision || !reason.trim()}
          >
            {decision === 'accept' ? 'Accept Change' : decision === 'reject' ? 'Reject Change' : 'Submit Decision'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineProgramDecision;