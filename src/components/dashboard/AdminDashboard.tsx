'use client';

import React, { useState, useEffect } from 'react';

import { StorageService } from '@/lib/data/storage';
import { WorkflowService } from '@/lib/workflow';
import { getStageName } from '@/lib/utils';
import Sidebar from '@/components/layout/Sidebar';
import { DashboardStats, Application } from '@/types';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Building2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    // Listen for data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('appleaction_')) {
        loadDashboardData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadDashboardData = () => {
    try {
      const dashboardStats = StorageService.getDashboardStats();
      const applications = StorageService.getApplications()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

      setStats(dashboardStats);
      setRecentApplications(applications);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar isAdmin={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 animate-fade-in">
      <Sidebar isAdmin={true} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700 animate-slide-up">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-300">Manage all student applications across partners</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-scale-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Applications</p>
                    <p className="text-3xl font-bold text-white">{stats?.totalApplications || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-900 rounded-full shadow-md">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-blue-400">+12%</span>
                  <span className="text-gray-400 ml-2">from last month</span>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-scale-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Pending Review</p>
                    <p className="text-3xl font-bold text-white">{stats?.pendingReview || 0}</p>
                  </div>
                  <div className="p-3 bg-yellow-900 rounded-full shadow-md">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-yellow-400">Requires attention</span>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-scale-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Approved</p>
                    <p className="text-3xl font-bold text-white">{stats?.approved || 0}</p>
                  </div>
                  <div className="p-3 bg-green-900 rounded-full shadow-md">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400">+8%</span>
                  <span className="text-gray-400 ml-2">success rate</span>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-scale-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Rejected</p>
                    <p className="text-3xl font-bold text-white">{stats?.rejected || 0}</p>
                  </div>
                  <div className="p-3 bg-red-900 rounded-full shadow-md">
                    <XCircle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownRight className="w-4 h-4 text-red-400 mr-1" />
                  <span className="text-red-400">-3%</span>
                  <span className="text-gray-400 ml-2">from last month</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
              {/* Applications by Stage */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Applications by Stage</h3>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(stage => {
                    const count = stats?.byStage[stage] || 0;
                    const percentage = stats?.totalApplications ? (count / stats.totalApplications) * 100 : 0;
                    const stageName = getStageName(stage);

                    return (
                      <div key={stage} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStageColor(stage)}`}>
                            {getStageName(stage)}
                          </span>
                          <span className="text-sm font-medium text-gray-300">{stageName}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
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
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {recentApplications.map(app => {
                    const student = StorageService.getStudent(app.studentId);
                    const partner = StorageService.getPartner(app.partnerId);
                    const statusDisplayName = WorkflowService.getStatusDisplayName(app.currentStage, app.currentStatus);

                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white text-xs font-bold">
                                  {student?.firstName?.charAt(0)}{student?.lastName?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {student?.firstName} {student?.lastName}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{partner?.name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(app.currentStatus)}`}>
                            {statusDisplayName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(app.updatedAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-gradient p-6 rounded-lg animate-scale-in">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center p-4 text-left hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500 hover:transform hover:scale-105">
                  <FileText className="w-8 h-8 text-blue-400 mr-3" />
                  <div>
                    <p className="font-medium text-white">Review Applications</p>
                    <p className="text-sm text-gray-400">Process pending applications</p>
                  </div>
                </button>
                
                <button className="flex items-center p-4 text-left hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500 hover:transform hover:scale-105">
                  <Users className="w-8 h-8 text-blue-400 mr-3" />
                  <div>
                    <p className="font-medium text-white">Manage Partners</p>
                    <p className="text-sm text-gray-400">View partner performance</p>
                  </div>
                </button>
                
                <button className="flex items-center p-4 text-left hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500 hover:transform hover:scale-105">
                  <Building2 className="w-8 h-8 text-blue-400 mr-3" />
                  <div>
                    <p className="font-medium text-white">System Analytics</p>
                    <p className="text-sm text-gray-400">View detailed reports</p>
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

export default AdminDashboard;