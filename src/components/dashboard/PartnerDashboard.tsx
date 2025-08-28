'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/lib/auth';
import { StorageService } from '@/lib/data/storage';
import { WorkflowService } from '@/lib/workflow';
import { getStageName } from '@/lib/utils';
import Sidebar from '@/components/layout/Sidebar';
import { DashboardStats, Application } from '@/types';
import {
  FileText,
  Clock,
  CheckCircle,

  Plus,
  TrendingUp,
  Activity,
  AlertCircle,

  ArrowUpRight,
} from 'lucide-react';

const PartnerDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [pendingActions, setPendingActions] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentUser = AuthService.getCurrentUser();
  const partnerId = currentUser?.partnerId;

  const loadDashboardData = useCallback(() => {
    console.log('🔍 PartnerDashboard: Loading data for partnerId:', partnerId);
    if (!partnerId) {
      console.log('❌ No partnerId found, cannot load applications');
      return;
    }

    try {
      const allApplications = StorageService.getApplications();
      const partnerApplications = StorageService.getApplications(partnerId);
      console.log('📊 All applications:', allApplications);
      console.log('📊 Partner applications for', partnerId, ':', partnerApplications);
      
      const dashboardStats = StorageService.getDashboardStats(partnerId);
      const applications = partnerApplications
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

      const pending = partnerApplications
        .filter(app => app.nextActor === 'Partner' && !app.currentStatus.includes('rejected'));

      setStats(dashboardStats);
      setRecentApplications(applications);
      setPendingActions(pending);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    if (partnerId) {
      loadDashboardData();

      // Listen for data changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key?.includes('appleaction_')) {
          loadDashboardData();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [partnerId, loadDashboardData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    if (status.includes('rejected')) return 'text-red-300 bg-red-900 border-red-700';
    if (status.includes('approved') || status === 'commission_paid') return 'text-green-300 bg-green-900 border-green-700';
    if (status.includes('waiting') || status.includes('pending')) return 'text-yellow-300 bg-yellow-900 border-yellow-700';
    return 'text-blue-300 bg-blue-900 border-blue-700';
  };

  const getStageColor = (stage: number) => {
    const colors = [
      'bg-purple-900 text-purple-300 border border-purple-700',
      'bg-blue-900 text-blue-300 border border-blue-700',
      'bg-green-900 text-green-300 border border-green-700',
      'bg-orange-900 text-orange-300 border border-orange-700',
      'bg-pink-900 text-pink-300 border border-pink-700',
    ];
    return colors[stage - 1] || colors[0];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900 text-red-300 border border-red-700';
      case 'medium': return 'bg-yellow-900 text-yellow-300 border border-yellow-700';
      case 'low': return 'bg-green-900 text-green-300 border border-green-700';
      default: return 'bg-gray-800 text-gray-300 border border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar isAdmin={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 animate-fade-in">
      <Sidebar isAdmin={false} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700 animate-slide-up">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Partner Dashboard</h1>
                <p className="text-gray-300">Manage your student applications and track progress</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="bg-green-600 hover:bg-green-700 flex items-center px-4 py-2 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Applications</p>
                    <p className="text-3xl font-bold text-white">{stats?.totalApplications || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-900 rounded-full">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400">+5</span>
                  <span className="text-gray-400 ml-2">this month</span>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Pending Actions</p>
                    <p className="text-3xl font-bold text-orange-400">{pendingActions.length}</p>
                  </div>
                  <div className="p-3 bg-orange-900 rounded-full">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-orange-400">Requires your attention</span>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Approved</p>
                    <p className="text-3xl font-bold text-green-400">{stats?.approved || 0}</p>
                  </div>
                  <div className="p-3 bg-green-900 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-400">Success rate: 85%</span>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">In Progress</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {(stats?.totalApplications || 0) - (stats?.approved || 0) - (stats?.rejected || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-900 rounded-full">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-blue-400">Processing through stages</span>
                </div>
              </div>
            </div>

            {/* Pending Actions Alert */}
            {pendingActions.length > 0 && (
              <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-400 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-300">
                    You have {pendingActions.length} application{pendingActions.length !== 1 ? "s" : ""} requiring action
                  </h3>
                </div>
                <p className="text-orange-400 mt-1">Please review and take necessary actions to keep applications moving forward.</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Actions */}
              {pendingActions.length > 0 && (
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Action Required</h3>
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="space-y-4">
                    {pendingActions.slice(0, 3).map(app => {
                      const student = StorageService.getStudent(app.studentId);

                      return (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-orange-900/20 rounded-lg border border-orange-700">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {student?.firstName?.charAt(0)}{student?.lastName?.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {student?.firstName} {student?.lastName}
                                </p>
                                <p className="text-xs text-gray-300">{app.nextAction}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(app.priority)}`}>
                              {app.priority}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(app.currentStage)}`}>
                              {getStageName(app.currentStage)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Applications by Stage */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Applications by Stage</h3>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(stage => {
                    const count = stats?.byStage[stage] || 0;
                    const percentage = stats?.totalApplications ? (count / stats.totalApplications) * 100 : 0;
                    const stageName = [
                      'Partner Submission',
                      'Offer Letter',
                      'Visa Processing',
                      'Student Arrival',
                      'Commission'
                    ][stage - 1];

                    return (
                      <div key={stage} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(stage)}`}>
                            {getStageName(stage)}
                          </span>
                          <span className="text-sm font-medium text-gray-300">{stageName}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-white w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {recentApplications.map(app => {
                    const student = StorageService.getStudent(app.studentId);
                    const statusDisplayName = WorkflowService.getStatusDisplayName(app.currentStage, app.currentStatus);

                    return (
                      <div key={app.id} className="flex items-center justify-between p-4 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {student?.firstName?.charAt(0)}{student?.lastName?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-white truncate">
                                  {student?.firstName} {student?.lastName}
                                </p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(app.priority)}`}>
                                  {app.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">{app.program} at {app.university}</p>
                              <p className="text-xs text-gray-400">Application ID: {app.id}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.currentStatus)}`}>
                              {statusDisplayName}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">{getStageName(app.currentStage)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Updated</p>
                            <p className="text-sm font-medium text-white">
                              {formatDate(app.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center p-4 text-left hover:bg-gray-700 rounded-lg transition-colors border border-gray-600">
                  <Plus className="w-8 h-8 text-green-400 mr-3" />
                  <div>
                    <p className="font-medium text-white">Submit Application</p>
                    <p className="text-sm text-gray-400">Create new student application</p>
                  </div>
                </button>
                
                <button className="flex items-center p-4 text-left hover:bg-gray-700 rounded-lg transition-colors border border-gray-600">
                  <FileText className="w-8 h-8 text-blue-400 mr-3" />
                  <div>
                    <p className="font-medium text-white">View All Applications</p>
                    <p className="text-sm text-gray-400">Manage your submissions</p>
                  </div>
                </button>
                
                <button className="flex items-center p-4 text-left hover:bg-gray-700 rounded-lg transition-colors border border-gray-600">
                  <span className="w-8 h-8 text-purple-400 mr-3">📅</span>
                  <div>
                    <p className="font-medium text-white">Track Progress</p>
                    <p className="text-sm text-gray-400">Monitor application status</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PartnerDashboard;