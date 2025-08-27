'use client';

import React from 'react';
import { Application } from '@/types';
import { getStatusDisplayForRole } from '@/lib/utils/status-display';
import { ChevronRight, Check, Clock, AlertCircle } from 'lucide-react';

interface WorkflowVisualizationProps {
  application: Application;
  role: 'admin' | 'partner';
}

const WORKFLOW_STAGES = [
  'new_application',
  'under_review_admin',
  'approved_stage1',
  'sent_to_university',
  'university_approved',
  'offer_letter_issued',
  'visa_processing',
  'visa_approved',
  'enrollment_completed',
  'success'
];

const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({
  application,
  role
}) => {
  const currentStatusIndex = WORKFLOW_STAGES.indexOf(application.currentStatus);

  const getStageStatus = (stageIndex: number) => {
    if (stageIndex < currentStatusIndex) return 'completed';
    if (stageIndex === currentStatusIndex) return 'current';
    return 'pending';
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'current':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStageClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'current':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Application Workflow Progress
      </h3>
      
      <div className="space-y-3">
        {WORKFLOW_STAGES.map((stage, index) => {
          const stageStatus = getStageStatus(index);
          const statusDisplay = getStatusDisplayForRole(stage, role);
          
          // Guard against undefined statusDisplay
          if (!statusDisplay) {
            return null;
          }
          
          return (
            <div key={stage} className="flex items-center space-x-3">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2
                ${getStageClasses(stageStatus)}
              `}>
                {getStageIcon(stageStatus)}
              </div>
              
              <div className="flex-1">
                <div className={`
                  px-3 py-2 rounded-lg border
                  ${getStageClasses(stageStatus)}
                `}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{statusDisplay.short}</h4>
                      <p className="text-sm opacity-75">{statusDisplay.description}</p>
                    </div>
                    
                    {stageStatus === 'current' && statusDisplay.urgency && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${statusDisplay.urgency === 'high' ? 'bg-red-100 text-red-700' :
                            statusDisplay.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'}
                        `}>
                          {statusDisplay.urgency} priority
                        </span>
                        {statusDisplay.action && (
                          <span className="text-gray-600">{statusDisplay.action}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {index < WORKFLOW_STAGES.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress: {currentStatusIndex + 1} of {WORKFLOW_STAGES.length} stages</span>
          <span>{Math.round(((currentStatusIndex + 1) / WORKFLOW_STAGES.length) * 100)}% complete</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStatusIndex + 1) / WORKFLOW_STAGES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualization;