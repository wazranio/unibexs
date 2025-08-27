'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { Application, Student, Partner, DocumentRequest } from '@/types';
import { WorkflowService } from '@/lib/workflow';
import { getStatusDisplayForRole } from '@/lib/utils/status-display';
import { getStageName } from '@/lib/utils';
import StatusUpdateModal from '@/components/workflow/StatusUpdateModal';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Edit3,
  FileText,
  Upload,
  User,
  Calendar,
  DollarSign,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';

interface StatusHeroCardProps {
  application: Application;
  student: Student;
  partner: Partner | null;
  documentRequest: DocumentRequest | null;
  isAdmin: boolean;
  onUpdate: (application: Application) => void;
}

const StatusHeroCard: React.FC<StatusHeroCardProps> = ({
  application,
  student,
  partner: _partner,
  documentRequest,
  isAdmin,
  onUpdate,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);

  const statusDisplay = getStatusDisplayForRole(application.currentStatus, isAdmin ? 'admin' : 'partner');
  const availableTransitions = WorkflowService.getAvailableTransitions(
    application.currentStage,
    application.currentStatus
  ).filter(status => {
    if (isAdmin) return true;
    const nextActor = WorkflowService.getNextActor(application.currentStage, status.key);
    return nextActor === 'Partner';
  });

  const hasActionRequired = application.nextActor === (isAdmin ? 'Admin' : 'Partner') || 
                           (documentRequest && !isAdmin && 
                            (documentRequest.status === 'pending' || 
                            documentRequest.status === 'partially_submitted'));

  const getStatusIcon = () => {
    if (application.currentStatus.includes('approved') || application.currentStatus.includes('success')) {
      return <CheckCircle className="w-6 h-6 text-emerald-500" />;
    }
    if (application.currentStatus.includes('rejected') || application.currentStatus.includes('failed')) {
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    }
    if (hasActionRequired) {
      return <Zap className="w-6 h-6 text-amber-500 animate-pulse" />;
    }
    return <Clock className="w-6 h-6 text-blue-500" />;
  };

  const getStatusGradient = () => {
    if (application.currentStatus.includes('approved') || application.currentStatus.includes('success')) {
      return 'from-emerald-500 to-teal-600';
    }
    if (application.currentStatus.includes('rejected') || application.currentStatus.includes('failed')) {
      return 'from-red-500 to-rose-600';
    }
    if (hasActionRequired) {
      return 'from-amber-500 to-orange-600';
    }
    return 'from-blue-500 to-indigo-600';
  };

  const getProgressPercentage = () => {
    const stageProgress = ((application.currentStage - 1) / 4) * 100;
    return Math.min(stageProgress, 100);
  };

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-indigo-100/30 rounded-3xl shadow-xl border border-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 p-8">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className={`p-4 bg-gradient-to-br ${getStatusGradient()} rounded-2xl shadow-lg`}>
                  {getStatusIcon()}
                </div>
                {hasActionRequired && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {statusDisplay.short}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100/80 text-blue-700 text-sm font-medium rounded-full backdrop-blur-sm">
                      Stage {application.currentStage}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm ${
                      application.priority === 'high' ? 'bg-red-100/80 text-red-700' :
                      application.priority === 'medium' ? 'bg-amber-100/80 text-amber-700' :
                      'bg-green-100/80 text-green-700'
                    }`}>
                      {application.priority} priority
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 max-w-md">
                  {statusDisplay.description}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/60 backdrop-blur-sm rounded-xl mb-2">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-slate-600">Student</p>
                <p className="font-semibold text-slate-800">{student.firstName}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/60 backdrop-blur-sm rounded-xl mb-2">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-slate-600">Intake</p>
                <p className="font-semibold text-slate-800">{application.intakeDate ? new Date(application.intakeDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'TBD'}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/60 backdrop-blur-sm rounded-xl mb-2">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm text-slate-600">Fee</p>
                <p className="font-semibold text-slate-800">${application.tuitionFee ? (application.tuitionFee / 1000).toFixed(0) + 'K' : 'TBD'}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/60 backdrop-blur-sm rounded-xl mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-slate-600">Progress</p>
                <p className="font-semibold text-slate-800">{getProgressPercentage().toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">Application Progress</p>
              <p className="text-sm text-slate-600">{getStageName(application.currentStage)}</p>
            </div>
            <div className="relative h-3 bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getStatusGradient()} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${getProgressPercentage()}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Application</span>
              <span>Review</span>
              <span>University</span>
              <span>Visa</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Action Section */}
          {hasActionRequired ? (
            <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-2xl p-6 border border-blue-200/50 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Action Required</h3>
                    <p className="text-slate-700 mb-4">
                      {documentRequest && !isAdmin ? (
                        `You need to upload ${documentRequest.documents.filter(d => d.status === 'pending' || d.status === 'resubmission_required').length} document(s) to proceed.`
                      ) : (
                        isAdmin 
                          ? application.nextAction?.replace(/Partner|Admin/g, 'you') || 'Review needed'
                          : application.nextAction || 'Action needed'
                      )}
                    </p>
                    
                    <div className="flex items-center space-x-3">
                      {documentRequest && !isAdmin && documentRequest.documents.some(d => d.status === 'pending' || d.status === 'resubmission_required') ? (
                        <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                          <Upload className="w-5 h-5 mr-2" />
                          Upload Documents
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      ) : availableTransitions.length > 0 ? (
                        <button 
                          onClick={() => setShowStatusModal(true)}
                          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Edit3 className="w-5 h-5 mr-2" />
                          Update Status
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      ) : null}
                      
                      <button className="flex items-center px-4 py-3 bg-white/60 backdrop-blur-sm text-slate-700 font-medium rounded-xl hover:bg-white/80 transition-all duration-200 border border-white/40">
                        <FileText className="w-5 h-5 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-green-200/50 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">Everything&apos;s on Track</h3>
                  <p className="text-slate-700">
                    {isAdmin 
                      ? `Application is being processed by ${application.nextActor}. Monitor for updates.`
                      : `Your application is being processed. ${application.nextAction}`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps Preview */}
          <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Next: {application.nextActor} will {application.nextAction?.toLowerCase() || 'proceed'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Last updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <StatusUpdateModal
          application={application}
          isAdmin={isAdmin}
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

export default StatusHeroCard;