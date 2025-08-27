'use client';

import React, { useState, useEffect } from 'react';
import { Application } from '@/types';
import { WorkflowService } from '@/lib/workflow';
import StatusUpdateModal from '@/components/workflow/StatusUpdateModal';
import {
  Edit3,
  Upload,
  MessageSquare,
  Bell,
  Share,
  Download,
  Eye,
  X,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface FloatingActionPanelProps {
  application: Application;
  isAdmin: boolean;
  onUpdate: (application: Application) => void;
}

const FloatingActionPanel: React.FC<FloatingActionPanelProps> = ({
  application,
  isAdmin,
  onUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; type: string; title: string; message: string; priority: string; timestamp: string }>>([]);

  // Get available actions based on current state
  const availableTransitions = WorkflowService.getAvailableTransitions(
    application.currentStage,
    application.currentStatus
  ).filter(status => {
    if (isAdmin) return true;
    const nextActor = WorkflowService.getNextActor(application.currentStage, status.key);
    return nextActor === 'Partner';
  });

  const hasActionRequired = application.nextActor === (isAdmin ? 'Admin' : 'Partner');
  const hasUrgentActions = hasActionRequired && application.priority === 'high';

  // Mock notifications based on application state
  useEffect(() => {
    const mockNotifications = [];
    
    if (hasActionRequired) {
      mockNotifications.push({
        id: 1,
        type: 'action_required',
        title: 'Action Required',
        message: application.nextAction || 'Action needed',
        priority: application.priority,
        timestamp: new Date().toISOString(),
      });
    }

    if (application.currentStatus.includes('rejected')) {
      mockNotifications.push({
        id: 2,
        type: 'rejected',
        title: 'Application Issue',
        message: 'Your application needs attention',
        priority: 'high',
        timestamp: new Date().toISOString(),
      });
    }

    setNotifications(mockNotifications);
  }, [application, hasActionRequired]);

  const primaryAction = () => {
    if (hasActionRequired && availableTransitions.length > 0) {
      return {
        icon: Edit3,
        label: 'Update Status',
        action: () => setShowStatusModal(true),
        color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        hoverColor: 'hover:from-blue-600 hover:to-indigo-700',
        urgent: hasUrgentActions,
      };
    }

    if (!isAdmin && hasActionRequired) {
      return {
        icon: Upload,
        label: 'Upload Documents',
        action: () => {/* Navigate to documents */},
        color: 'bg-gradient-to-r from-green-500 to-emerald-600',
        hoverColor: 'hover:from-green-600 hover:to-emerald-700',
        urgent: hasUrgentActions,
      };
    }

    return {
      icon: Eye,
      label: 'View Details',
      action: () => {/* Default action */},
      color: 'bg-gradient-to-r from-slate-500 to-slate-600',
      hoverColor: 'hover:from-slate-600 hover:to-slate-700',
      urgent: false,
    };
  };

  const secondaryActions = [
    {
      icon: MessageSquare,
      label: 'Comments',
      action: () => {/* Toggle comments */},
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: Share,
      label: 'Share',
      action: () => {/* Share application */},
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      icon: Download,
      label: 'Export',
      action: () => {/* Export data */},
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      icon: Bell,
      label: 'Notifications',
      action: () => {/* Show notifications */},
      color: 'bg-orange-500 hover:bg-orange-600',
      badge: notifications.length > 0 ? notifications.length : undefined,
    },
  ];

  const primary = primaryAction();

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Notification Indicator */}
          {hasUrgentActions && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse z-10">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Secondary Actions - Show when expanded */}
          {isExpanded && (
            <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
              {secondaryActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 animate-in slide-in-from-right-2 fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Action Label */}
                  <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm opacity-0 animate-in fade-in slide-in-from-right-2">
                    {action.label}
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={action.action}
                    className={`relative w-12 h-12 rounded-full ${action.color} text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center`}
                    title={action.label}
                  >
                    <action.icon className="w-6 h-6" />
                    
                    {/* Badge */}
                    {action.badge && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{action.badge}</span>
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={() => {
              if (isExpanded) {
                primary.action();
              }
              setIsExpanded(!isExpanded);
            }}
            className={`relative w-16 h-16 rounded-full ${primary.color} ${primary.hoverColor} text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group`}
            title={primary.label}
          >
            {/* Pulsing Ring for Urgent Actions */}
            {primary.urgent && (
              <>
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
                <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-50"></div>
              </>
            )}

            {/* Main Icon */}
            <div className="relative z-10">
              {isExpanded ? (
                <X className="w-8 h-8 transform rotate-0 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <primary.icon className={`w-8 h-8 ${primary.urgent ? 'animate-bounce' : ''}`} />
              )}
            </div>

            {/* Floating Label */}
            {!isExpanded && (
              <div className="absolute right-full mr-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {primary.label}
              </div>
            )}
          </button>

          {/* Status Indicator */}
          <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            {hasActionRequired ? (
              <Zap className="w-4 h-4 text-amber-500" />
            ) : application.currentStatus.includes('approved') ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Clock className="w-4 h-4 text-blue-500" />
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel - Desktop Only */}
      <div className="hidden xl:flex fixed bottom-6 left-6 z-40">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
            
            {/* Application Status */}
            <div className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                hasActionRequired ? 'bg-amber-500 animate-pulse' :
                application.currentStatus.includes('approved') ? 'bg-green-500' :
                'bg-blue-500'
              }`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {application.currentStatus.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-slate-500">
                  {hasActionRequired ? 'Action Required' : 'On Track'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{application.currentStage}</p>
                <p className="text-xs text-blue-700">Current Stage</p>
              </div>
              <div className="p-3 bg-green-50/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(((application.currentStage - 1) / 4) * 100)}%
                </p>
                <p className="text-xs text-green-700">Progress</p>
              </div>
            </div>

            {/* Recent Activity */}
            {application.stageHistory && application.stageHistory.length > 0 && (
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <p className="text-xs font-medium text-slate-700 mb-2">Latest Update</p>
                <p className="text-xs text-slate-600">
                  {application.stageHistory && application.stageHistory.length > 0 && 
                    new Date(application.stageHistory[application.stageHistory.length - 1].timestamp).toLocaleDateString()}
                </p>
              </div>
            )}
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

export default FloatingActionPanel;