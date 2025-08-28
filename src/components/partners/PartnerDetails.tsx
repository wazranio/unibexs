'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Partner, Application, Student } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Users,
  GraduationCap,
  TrendingUp,
  Edit,
  UserCheck,
  UserX,
  Shield,
  FileCheck,
  Download,
  Eye,
  Upload,
  CreditCard,
  Home,
} from 'lucide-react';

interface PartnerDetailsProps {
  partner: Partner;
}

const PartnerDetails: React.FC<PartnerDetailsProps> = ({ partner }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    const loadPartnerData = () => {
      try {
        // Get all applications for this partner
        const allApplications = StorageService.getApplications();
        const partnerApplications = allApplications.filter(app => app.partnerId === partner.id);
        
        // Get all students from those applications
        const allStudents = StorageService.getStudents();
        const partnerStudentIds = new Set(partnerApplications.map(app => app.studentId));
        const partnerStudents = allStudents.filter(student => partnerStudentIds.has(student.id));
        
        setApplications(partnerApplications);
        setStudents(partnerStudents);
      } catch (error) {
        console.error('Error loading partner data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPartnerData();
  }, [partner.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-300 bg-green-900 border-green-700';
      case 'rejected': return 'text-red-300 bg-red-900 border-red-700';
      case 'pending': return 'text-yellow-300 bg-yellow-900 border-yellow-700';
      default: return 'text-gray-300 bg-gray-800 border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'rejected': return <XCircle className="w-4 h-4 mr-1" />;
      case 'pending': return <Clock className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateSuccessRate = () => {
    if (applications.length === 0) return 0;
    const approvedApps = applications.filter(app => 
      app.currentStatus.includes('approved') || 
      app.currentStatus === 'commission_paid'
    ).length;
    return Math.round((approvedApps / applications.length) * 100);
  };

  const getRecentApplications = () => {
    return applications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const handleApprovePartner = () => {
    // Update partner status to approved
    const updatedPartner = { ...partner, status: 'approved' as const };
    StorageService.savePartner(updatedPartner);
    window.location.reload(); // Refresh the page
  };

  const handleRejectPartner = () => {
    // Update partner status to rejected
    const updatedPartner = { ...partner, status: 'rejected' as const };
    StorageService.savePartner(updatedPartner);
    window.location.reload(); // Refresh the page
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/admin/partners"
                  className="flex items-center text-gray-400 hover:text-gray-200 transition-colors mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Partners
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">Partner Details</h1>
                  <p className="text-gray-300">
                    Comprehensive information for {partner.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {partner.status === 'pending' && (
                  <>
                    <button
                      onClick={handleApprovePartner}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Approve Partner
                    </button>
                    <button
                      onClick={handleRejectPartner}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Reject Partner
                    </button>
                  </>
                )}
                <button className="flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Partner
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Partner Profile Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mr-4 border border-gray-600">
                    {partner.type === 'business' ? (
                      <Building2 className="w-8 h-8 text-gray-300" />
                    ) : (
                      <User className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{partner.name}</h2>
                    {partner.businessName && (
                      <p className="text-lg text-gray-300">{partner.businessName}</p>
                    )}
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-400 mr-3 capitalize">
                        {partner.type} Partner
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(partner.status)}`}>
                        {getStatusIcon(partner.status)}
                        {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Registered</p>
                  <p className="text-sm font-medium text-gray-300">{formatDate(partner.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="bg-blue-600 p-3 rounded-lg mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Total Applications</p>
                    <p className="text-2xl font-bold text-white">{applications.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="bg-green-600 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Active Students</p>
                    <p className="text-2xl font-bold text-white">{students.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="bg-purple-600 p-3 rounded-lg mr-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-white">{calculateSuccessRate()}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="bg-orange-600 p-3 rounded-lg mr-4">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Countries</p>
                    <p className="text-2xl font-bold text-white">
                      {new Set(students.map(s => s.nationality)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Compliance Status */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">KYC Compliance Status</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-300 border border-green-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Verified
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FileCheck className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-sm font-medium text-white">Identity Documents</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full border border-green-700">
                      Approved
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {partner.type === 'business' ? 'Business registration verified' : 'Passport/ID verified'}
                  </p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-sm font-medium text-white">Financial Documents</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full border border-green-700">
                      Approved
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Bank statements and tax documents
                  </p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Home className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-sm font-medium text-white">Address Verification</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full border border-green-700">
                      Approved
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Utility bill and address proof
                  </p>
                </div>
              </div>
            </div>

            {/* Document Verification */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Document Verification</h3>
                  <button className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    Request Documents
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Individual Partner Documents */}
                  {partner.type === 'individual' && (
                    <>
                      <div className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4 border border-gray-600">
                              <User className="w-6 h-6 text-gray-300" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">Passport Copy</h4>
                              <p className="text-sm text-gray-400">passport_copy.pdf • 2.1 MB</p>
                              <p className="text-xs text-gray-500">Uploaded on {formatDate(partner.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4 border border-gray-600">
                              <FileText className="w-6 h-6 text-gray-300" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">ID Card Copy</h4>
                              <p className="text-sm text-gray-400">national_id.pdf • 1.8 MB</p>
                              <p className="text-xs text-gray-500">Uploaded on {formatDate(partner.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Business Partner Documents */}
                  {partner.type === 'business' && (
                    <>
                      <div className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4 border border-gray-600">
                              <Building2 className="w-6 h-6 text-gray-300" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">Business Registration</h4>
                              <p className="text-sm text-gray-400">business_registration.pdf • 3.2 MB</p>
                              <p className="text-xs text-gray-500">Uploaded on {formatDate(partner.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4 border border-gray-600">
                              <FileCheck className="w-6 h-6 text-gray-300" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">Trading License</h4>
                              <p className="text-sm text-gray-400">trading_license.pdf • 2.7 MB</p>
                              <p className="text-xs text-gray-500">Uploaded on {formatDate(partner.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4 border border-gray-600">
                              <CreditCard className="w-6 h-6 text-gray-300" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">Tax Certificate</h4>
                              <p className="text-sm text-gray-400">tax_certificate.pdf • 1.9 MB</p>
                              <p className="text-xs text-gray-500">Uploaded on {formatDate(partner.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information (for business partners only) */}
            {partner.type === 'business' && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Business Name</p>
                      <p className="text-white">{partner.businessName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Registration Number</p>
                      <p className="text-white">{partner.registrationNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Contact Person</p>
                      <p className="text-white">{partner.contactPerson || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Home className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Business Address</p>
                      <p className="text-white">{partner.address || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{partner.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white">{partner.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Country</p>
                    <p className="text-white">{partner.country}</p>
                  </div>
                </div>
                {partner.type === 'individual' && partner.address && (
                  <div className="flex items-center md:col-span-2">
                    <Home className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-white">{partner.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
                  <Link
                    href="/admin/applications"
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    View All Applications
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : getRecentApplications().length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-medium text-gray-300">No Applications</h3>
                    <p className="text-sm text-gray-400">This partner hasn&apos;t submitted any applications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getRecentApplications().map((application) => {
                      const student = students.find(s => s.id === application.studentId);
                      return (
                        <div key={application.id} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">
                                {student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}
                              </h4>
                              <p className="text-sm text-gray-300">{application.program}</p>
                              <p className="text-sm text-gray-400">{application.university}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.currentStatus.includes('approved') ? 'approved' : application.currentStatus.includes('rejected') ? 'rejected' : 'pending')}`}>
                                Stage {application.currentStage}
                              </span>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(application.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Students Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Students Brought by Partner</h3>
                  <Link
                    href="/admin/students"
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    View All Students
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-medium text-gray-300">No Students</h3>
                    <p className="text-sm text-gray-400">This partner hasn&apos;t brought any students yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.slice(0, 6).map((student) => (
                      <div key={student.id} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-gray-300" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">
                              {student.firstName} {student.lastName}
                            </h4>
                            <p className="text-sm text-gray-400">{student.nationality}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{student.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Registered: {formatDate(student.createdAt)}
                        </p>
                      </div>
                    ))}
                    {students.length > 6 && (
                      <div className="border border-gray-700 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-gray-300 font-medium">+{students.length - 6} more</p>
                          <p className="text-sm text-gray-400">students</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PartnerDetails;