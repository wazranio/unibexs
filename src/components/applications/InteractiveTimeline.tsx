'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { Application } from '@/types';
import { WorkflowService } from '@/lib/workflow';
import { getStatusDisplayForRole } from '@/lib/utils/status-display';
import {
  CheckCircle,
  FileText,
  GraduationCap,
  Building2,
  Plane,
  Award,
  ChevronRight,
  ChevronDown,
  User,
  Calendar,
  MessageSquare,
  Upload,
} from 'lucide-react';

interface InteractiveTimelineProps {
  application: Application;
  isAdmin: boolean;
}

const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  application,
  isAdmin,
}) => {
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set([application.currentStage]));

  const stages: Array<{ stage: number; name: string; icon: React.ElementType; description: string; color: string }> = [
    {
      stage: 1,
      name: 'Application Review',
      icon: FileText,
      description: 'Initial application review and document verification',
      color: 'blue',
    },
    {
      stage: 2,
      name: 'Academic Assessment',
      icon: GraduationCap,
      description: 'Academic qualifications and program suitability review',
      color: 'purple',
    },
    {
      stage: 3,
      name: 'University Processing',
      icon: Building2,
      description: 'University admission review and decision',
      color: 'green',
    },
    {
      stage: 4,
      name: 'Visa Processing',
      icon: Plane,
      description: 'Student visa application and approval process',
      color: 'orange',
    },
    {
      stage: 5,
      name: 'Enrollment',
      icon: Award,
      description: 'Final enrollment and program commencement',
      color: 'emerald',
    },
  ];

  const getStageStatus = (stageNumber: number) => {
    if (stageNumber < application.currentStage) return 'completed';
    if (stageNumber === application.currentStage) return 'current';
    return 'pending';
  };

  const getStageIcon = (stage: { icon: React.ElementType; stage: number }) => {
    const Icon = stage.icon;
    const status = getStageStatus(stage.stage);
    
    if (status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-white" />;
    }
    if (status === 'current') {
      return <Icon className="w-6 h-6 text-white animate-pulse" />;
    }
    return <Icon className="w-6 h-6 text-gray-400" />;
  };

  const getStageClasses = (stageNumber: number, color: string) => {
    const status = getStageStatus(stageNumber);
    
    if (status === 'completed') {
      return 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200';
    }
    if (status === 'current') {
      return `bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg shadow-${color}-200 ring-4 ring-${color}-200`;
    }
    return 'bg-gray-200 shadow-sm';
  };

  const toggleStageExpansion = (stageNumber: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageNumber)) {
      newExpanded.delete(stageNumber);
    } else {
      newExpanded.add(stageNumber);
    }
    setExpandedStages(newExpanded);
  };

  const getStageHistory = (stageNumber: number) => {
    return application.stageHistory?.filter(entry => entry.stage === stageNumber) || [];
  };

  return (
    <div className="space-y-8">
      {/* Timeline Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Application Timeline
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Progress</span>
              <span className="text-sm text-slate-600">Stage {application.currentStage} of 5</span>
            </div>
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                style={{ width: `${((application.currentStage - 1) / 4) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800">
              {Math.round(((application.currentStage - 1) / 4) * 100)}%
            </div>
            <div className="text-sm text-slate-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 via-slate-200 to-transparent z-0"></div>

        <div className="space-y-6">
          {stages.map((stage, _index) => {
            const status = getStageStatus(stage.stage);
            const isExpanded = expandedStages.has(stage.stage);
            const stageHistory = getStageHistory(stage.stage);
            const statusDisplay = application.currentStage === stage.stage ? 
              getStatusDisplayForRole(application.currentStatus, isAdmin ? 'admin' : 'partner') : null;

            return (
              <div key={stage.stage} className="relative z-10">
                <div className="flex items-start space-x-6">
                  {/* Stage Icon */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getStageClasses(stage.stage, stage.color)} transition-all duration-300`}>
                      {getStageIcon(stage)}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'completed' ? 'bg-green-100 text-green-700' :
                        status === 'current' ? `bg-${stage.color}-100 text-${stage.color}-700` :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {stage.stage}
                      </span>
                    </div>
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => toggleStageExpansion(stage.stage)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-slate-800">{stage.name}</h3>
                            {status === 'current' && statusDisplay && (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                application.currentStatus.includes('approved') ? 'bg-green-100 text-green-700' :
                                application.currentStatus.includes('rejected') ? 'bg-red-100 text-red-700' :
                                application.nextActor === (isAdmin ? 'Admin' : 'Partner') ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {statusDisplay.short}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mb-3">{stage.description}</p>
                          
                          {/* Current Stage Details */}
                          {status === 'current' && statusDisplay && (
                            <div className="space-y-3">
                              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/50">
                                <p className="text-sm text-blue-800 font-medium mb-1">Current Status</p>
                                <p className="text-sm text-blue-700">{statusDisplay.description}</p>
                                {application.nextAction && (
                                  <p className="text-sm text-blue-600 mt-2">
                                    <strong>Next:</strong> {application.nextAction}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Stage Statistics */}
                          {stageHistory.length > 0 && (
                            <div className="flex items-center space-x-4 text-sm text-slate-500 mt-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Started: {new Date(stageHistory[0].timestamp).toLocaleDateString()}</span>
                              </div>
                              {status === 'completed' && stageHistory.length > 1 && (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Completed: {new Date(stageHistory[stageHistory.length - 1].timestamp).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Stage Actions */}
                          {status === 'current' && (
                            <div className="flex items-center space-x-2">
                              <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                                <Upload className="w-4 h-4" />
                              </button>
                              <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                          {/* Stage History */}
                          {stageHistory.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Stage History</h4>
                              <div className="space-y-3">
                                {stageHistory.map((entry, entryIndex) => (
                                  <div key={entryIndex} className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-slate-800">
                                          {WorkflowService.getStatusDisplayName(entry.stage, entry.status)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <User className="w-3 h-3 text-slate-400" />
                                        <p className="text-xs text-slate-600">By {entry.actor}</p>
                                      </div>
                                      {entry.notes && (
                                        <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-100/50 rounded">
                                          {entry.notes}
                                        </p>
                                      )}
                                      {entry.reason && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                          <p className="text-sm text-red-800">
                                            <strong>Reason:</strong> {entry.reason}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Stage Requirements */}
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Requirements & Documents</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                                <div className="flex items-center space-x-2 mb-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">Documents Required</span>
                                </div>
                                <ul className="text-sm text-blue-700 space-y-1">
                                  <li>• Academic transcripts</li>
                                  <li>• Personal statement</li>
                                  <li>• Recommendation letters</li>
                                </ul>
                              </div>
                              <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/50">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-800">Completed Items</span>
                                </div>
                                <ul className="text-sm text-green-700 space-y-1">
                                  <li>• Initial application form</li>
                                  <li>• Identity verification</li>
                                  <li>• Fee payment</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InteractiveTimeline;