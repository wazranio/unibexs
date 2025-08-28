'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { Application } from '@/types';
import { WorkflowService } from '@/lib/workflow';
import { StorageService } from '@/lib/data/storage';
import { X, Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface BulkStatusUpdateModalProps {
  selectedApplications: Application[];
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedApplications: Application[]) => void;
}

const BulkStatusUpdateModal: React.FC<BulkStatusUpdateModalProps> = ({
  selectedApplications,
  isAdmin: _isAdmin,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [newStage, setNewStage] = useState('');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsProcessing(true);
    setErrors([]);
    
    const updatedApplications: Application[] = [];
    const validationErrors: string[] = [];

    try {
      for (const app of selectedApplications) {
        const updatedApp = { ...app };
        let hasUpdates = false;

        // Update status if provided
        if (newStatus && newStatus !== app.currentStatus) {
          // Validate status transition
          if (!WorkflowService.validateStatusTransition(app.currentStage, app.currentStatus, newStatus)) {
            validationErrors.push(`Invalid status transition for ${app.id}: ${app.currentStatus} → ${newStatus}`);
            continue;
          }
          
          updatedApp.currentStatus = newStatus;
          hasUpdates = true;
        }

        // Update stage if provided
        if (newStage && parseInt(newStage) !== app.currentStage) {
          updatedApp.currentStage = parseInt(newStage) as 1 | 2 | 3 | 4 | 5;
          
          // If stage changed but no status provided, set to first status of new stage
          if (!newStatus) {
            const stageInfo = WorkflowService.getStage(parseInt(newStage) as 1 | 2 | 3 | 4 | 5);
            if (stageInfo && stageInfo.statuses.length > 0) {
              updatedApp.currentStatus = stageInfo.statuses[0].key;
            }
          }
          hasUpdates = true;
        }

        if (hasUpdates) {
          updatedApp.updatedAt = new Date().toISOString();
          
          // Add reason to notes if provided
          if (reason.trim()) {
            const reasonNote = `${new Date().toISOString()}: Bulk update - ${reason}`;
            updatedApp.notes = updatedApp.notes ? `${updatedApp.notes}\n\n${reasonNote}` : reasonNote;
          }

          // Update in storage
          StorageService.updateApplication(updatedApp);
          updatedApplications.push(updatedApp);
        }
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Notify parent of updates
      onUpdate(updatedApplications);
      
      // Reset form and close
      setNewStatus('');
      setNewStage('');
      setReason('');
      onClose();

    } catch (error) {
      console.error('Bulk update failed:', error);
      setErrors(['Failed to update applications. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const allStatuses = WorkflowService.getAllStatuses();
  const allStages = WorkflowService.getAllStageOptions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bulk Status Update</h2>
              <p className="text-sm text-gray-600">
                Update {selectedApplications.length} selected application{selectedApplications.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Selected Applications Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Selected Applications</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedApplications.map(app => (
                <div key={app.id} className="flex items-center justify-between bg-white rounded p-2 text-sm">
                  <span className="font-mono">#{app.id.substring(0, 8)}</span>
                  <span className="text-gray-600">{app.program}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Stage {app.currentStage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Update Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Stage (optional)
              </label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Keep current stage</option>
                {allStages.map(stage => (
                  <option key={stage.value} value={stage.value.toString()}>
                    Stage {stage.value}: {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status (optional)
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Keep current status</option>
                {Object.entries(allStatuses).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Update
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain the reason for this bulk update..."
              />
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-800">Validation Errors</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {(newStatus || newStage) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Update Preview</h4>
              </div>
              <div className="text-sm text-blue-700">
                {selectedApplications.length} application{selectedApplications.length !== 1 ? "s" : ""} will be updated:
                {newStage && <div>• Stage → {WorkflowService.getStageName(parseInt(newStage))}</div>}
                {newStatus && <div>• Status → {allStatuses[newStatus]}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || (!newStatus && !newStage)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Update Applications</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkStatusUpdateModal;