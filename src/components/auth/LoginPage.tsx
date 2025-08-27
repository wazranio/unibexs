'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { initializeDataV2 } from '@/lib/data/initialize-v2';
import { StorageService } from '@/lib/data/storage';
import DataInitializationModal from '@/components/modals/DataInitializationModal';
import { Eye, EyeOff, Database, User, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [initializationData, setInitializationData] = useState<Record<string, unknown> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const session = await AuthService.login(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      // Redirect based on role
      if (session.user.role === 'admin') {
        router.push('/admin/applications');
      } else {
        router.push('/partner/applications');
      }
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    const adminCreds = AuthService.getAdminCredentials();
    setFormData(prev => ({
      ...prev,
      email: adminCreds.email,
      password: adminCreds.password,
    }));
    setError('');
  };

  const fillPartnerCredentials = () => {
    const partnerCreds = AuthService.getPartnerCredentials();
    setFormData(prev => ({
      ...prev,
      email: partnerCreds.email,
      password: partnerCreds.password,
    }));
    setError('');
  };

  const initializeData = async () => {
    setIsInitializing(true);
    setError('');

    try {
      // Use V2 initialization for single student journey
      await initializeDataV2();
      
      // Collect the initialized data for display
      const applications = StorageService.getApplications();
      const students = StorageService.getStudents();
      const partners = StorageService.getPartners();
      const auditLog = StorageService.getAuditLog();
      
      if (applications.length > 0 && students.length > 0) {
        const student = students[0];
        const application = applications[0];
        const documents = StorageService.getDocuments(application.id);
        
        const approvedDocs = documents.filter(doc => doc.status === 'approved');
        const pendingDocs = documents.filter(doc => doc.status === 'pending');
        
        // Group documents by stage
        const documentsByStage = documents.reduce((acc: Array<{ stage: number; name: string; count: number; documents: string[] }>, doc) => {
          const stage = acc.find(s => s.stage === doc.stage);
          if (stage) {
            stage.documents.push(doc.fileName);
            stage.count++;
          } else {
            acc.push({
              stage: doc.stage,
              name: doc.stage === 1 ? 'Application Documents' : 
                    doc.stage === 2 ? 'Offer Letter Documents' : 'Visa Documents',
              count: 1,
              documents: [doc.fileName]
            });
          }
          return acc;
        }, []);

        const modalData = {
          student: {
            name: `${student.firstName} ${student.lastName}`,
            email: student.email,
            nationality: student.nationality,
            passportNumber: student.passportNumber
          },
          application: {
            id: application.id,
            program: application.program,
            university: application.university,
            status: application.currentStatus,
            stage: application.currentStage,
            priority: application.priority
          },
          documents: {
            total: documents.length,
            approved: approvedDocs.length,
            pending: pendingDocs.length,
            byStage: documentsByStage
          },
          stats: {
            applications: applications.length,
            students: students.length,
            partners: partners.length,
            auditEntries: auditLog.length
          }
        };

        setInitializationData(modalData);
        setShowDataModal(true);
      } else {
        setError('Failed to initialize data properly.');
      }
    } catch (err) {
      console.error('Failed to initialize data:', err);
      setError('Failed to initialize data. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
            Welcome to UniBexs
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            AppleAction Application Management System
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-gray-800 p-8 rounded-2xl shadow-xl shadow-gray-900/50 border border-gray-700" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg leading-5 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg leading-5 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                Remember me for 30 days
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-900 p-4 border-l-4 border-red-700 shadow-md">
              <div className="text-sm text-red-200">{error}</div>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Quick Login Buttons */}
          <div className="mt-6 space-y-3">
            <div className="text-center text-sm text-gray-400 mb-4 font-medium">
              Quick Login for Testing
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
              >
                <User className="h-4 w-4 mr-2" />
                Fill Admin
              </button>
              
              <button
                type="button"
                onClick={fillPartnerCredentials}
                className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
              >
                <User className="h-4 w-4 mr-2" />
                Fill Partner
              </button>
            </div>
          </div>

          {/* Initialize Data Button */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={initializeData}
              disabled={isInitializing}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-500/20"
            >
              <Database className="h-5 w-5 mr-2" />
              {isInitializing ? 'Loading Test Data...' : 'Initialize V2 Data (Single Student)'}
            </button>
            <p className="mt-2 text-xs text-gray-400 text-center">
              Click to load single student application for complete journey testing
            </p>
          </div>
        </form>

        {/* Demo Credentials Info */}
        <div className="text-center text-xs text-gray-400 bg-gray-800 rounded-lg p-4 shadow-lg shadow-gray-900/50 border border-gray-700">
          <p className="font-semibold text-white mb-3">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="font-semibold text-white">Admin Access</p>
              <p className="text-gray-300">admin@unibexs.com</p>
              <p className="text-gray-300">admin123</p>
              <p className="text-xs text-gray-400 mt-1">Acts on behalf of University & Immigration</p>
            </div>
            <div>
              <p className="font-semibold text-white">Partner Access</p>
              <p className="text-gray-300">partner@techcorp.com</p>
              <p className="text-gray-300">partner123</p>
              <p className="text-xs text-gray-400 mt-1">Submit applications & documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Initialization Modal */}
      {initializationData && (
        <DataInitializationModal
          isOpen={showDataModal}
          onClose={() => setShowDataModal(false)}
          data={initializationData as never}
        />
      )}
    </div>
  );
};

export default LoginPage;