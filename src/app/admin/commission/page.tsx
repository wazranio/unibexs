'use client';

import React, { useState, useEffect } from 'react';
import { Commission, CommissionPipelineStats } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import { formatCommissionAmount } from '@/lib/commission/commission-calculator';
import Sidebar from '@/components/layout/Sidebar';
import {
  Eye,
  CheckCircle,
  Upload,
  Download,
  DollarSign,
  Clock,
  Search,
  Calendar,
  User,
  GraduationCap,
  Building2,
} from 'lucide-react';

export default function AdminCommissionPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionPipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const allCommissions = StorageService.getCommissions();
      const pipelineStats = StorageService.getCommissionPipelineStats();
      
      setCommissions(allCommissions);
      setStats(pipelineStats);
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommissions = commissions.filter(commission => {
    // Status filter
    if (selectedStatus !== 'all' && commission.status !== selectedStatus) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const student = StorageService.getStudents().find(s => s.id === commission.studentId);
      const partner = StorageService.getPartners().find(p => p.id === commission.partnerId);
      
      return (
        (student?.firstName + ' ' + student?.lastName).toLowerCase().includes(searchLower) ||
        partner?.name.toLowerCase().includes(searchLower) ||
        commission.university.toLowerCase().includes(searchLower) ||
        commission.program.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const handleApproveCommission = (commission: Commission) => {
    setSelectedCommission(commission);
    setShowApprovalModal(true);
  };

  const handleReleasePayment = (commission: Commission) => {
    setSelectedCommission(commission);
    setShowReleaseModal(true);
  };

  const confirmApproval = () => {
    if (!selectedCommission) return;

    const updatedCommission = {
      ...selectedCommission,
      status: 'commission_approved' as const,
      approvedAt: new Date(),
      approvedBy: AuthService.getCurrentUser()?.id || 'admin',
    };

    StorageService.saveCommission(updatedCommission);
    setShowApprovalModal(false);
    setSelectedCommission(null);
    loadData();
  };

  const confirmRelease = (transferReference: string, transferDocumentUrl: string) => {
    if (!selectedCommission) return;

    const updatedCommission = {
      ...selectedCommission,
      status: 'commission_released' as const,
      releasedAt: new Date(),
      releasedBy: AuthService.getCurrentUser()?.id || 'admin',
      transferReference,
      transferDocumentUrl,
    };

    StorageService.saveCommission(updatedCommission);
    setShowReleaseModal(false);
    setSelectedCommission(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading commissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Commission Management</h1>
            <p className="text-gray-400">Manage partner commissions through the 3-stage pipeline</p>
          </div>

          {/* Pipeline Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Pending */}
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-yellow-400 font-bold text-lg">⏳ PENDING</h3>
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-white text-2xl font-bold">{stats.pending.count}</p>
                  <p className="text-yellow-300">{formatCommissionAmount(stats.pending.totalAmount)}</p>
                  <p className="text-yellow-200 text-sm">Oldest: {stats.pending.oldestDays} days</p>
                </div>
              </div>

              {/* Approved */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-blue-400 font-bold text-lg">✅ APPROVED</h3>
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-white text-2xl font-bold">{stats.approved.count}</p>
                  <p className="text-blue-300">{formatCommissionAmount(stats.approved.totalAmount)}</p>
                  <p className="text-blue-200 text-sm">Ready for payment</p>
                </div>
              </div>

              {/* Paid */}
              <div className="bg-gray-900/20 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-bold text-lg">💰 PAID</h3>
                  <DollarSign className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-white text-2xl font-bold">{stats.paid.count}</p>
                  <p className="text-gray-300">{formatCommissionAmount(stats.paid.totalAmount)}</p>
                  <p className="text-green-300 text-sm">This month: {formatCommissionAmount(stats.paid.thisMonth)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student, partner, university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="commission_pending">Pending</option>
                  <option value="commission_approved">Approved</option>
                  <option value="commission_released">Released</option>
                  <option value="commission_paid">Paid</option>
                </select>
              </div>

              {/* Export Button */}
              <div>
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Commission Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Partner</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Program</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredCommissions.map((commission) => {
                    const student = StorageService.getStudents().find(s => s.id === commission.studentId);
                    const partner = StorageService.getPartners().find(p => p.id === commission.partnerId);
                    
                    return (
                      <tr key={commission.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">{student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</p>
                              <p className="text-gray-400 text-sm">{student?.nationality || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">{partner?.name || 'Unknown'}</p>
                              <p className="text-gray-400 text-sm capitalize">{commission.partnerTier} tier</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <GraduationCap className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">{commission.program}</p>
                              <p className="text-gray-400 text-sm">{commission.university}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{formatCommissionAmount(commission.commissionAmount)}</p>
                            <p className="text-gray-400 text-sm">{(commission.commissionRate * 100).toFixed(1)}% of {formatCommissionAmount(commission.tuitionFee)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                            commission.status === 'commission_pending' ? 'bg-yellow-900/30 text-yellow-400' :
                            commission.status === 'commission_approved' ? 'bg-blue-900/30 text-blue-400' :
                            commission.status === 'commission_released' ? 'bg-green-900/30 text-green-400' :
                            'bg-gray-900/30 text-gray-400'
                          }`}>
                            {commission.status.replace('commission_', '').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-white text-sm">{commission.createdAt.toLocaleDateString()}</p>
                              <p className="text-gray-400 text-xs">{Math.floor((Date.now() - commission.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {commission.status === 'commission_pending' && (
                              <button
                                onClick={() => handleApproveCommission(commission)}
                                className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </button>
                            )}
                            
                            {commission.status === 'commission_approved' && (
                              <button
                                onClick={() => handleReleasePayment(commission)}
                                className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Release
                              </button>
                            )}

                            <button className="flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredCommissions.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Commissions Found</h3>
                <p className="text-gray-500">No commissions match your current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedCommission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Approve Commission</h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-gray-300">
                <strong>Student:</strong> {(() => {
                  const student = StorageService.getStudents().find(s => s.id === selectedCommission.studentId);
                  return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
                })()}
              </p>
              <p className="text-gray-300">
                <strong>Partner:</strong> {StorageService.getPartners().find(p => p.id === selectedCommission.partnerId)?.name}
              </p>
              <p className="text-gray-300">
                <strong>Amount:</strong> {formatCommissionAmount(selectedCommission.commissionAmount)}
              </p>
              <p className="text-gray-300">
                <strong>Rate:</strong> {(selectedCommission.commissionRate * 100).toFixed(1)}%
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmApproval}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Approve Commission
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Release Payment Modal */}
      {showReleaseModal && selectedCommission && (
        <PaymentReleaseModal
          commission={selectedCommission}
          onConfirm={confirmRelease}
          onCancel={() => setShowReleaseModal(false)}
        />
      )}
    </div>
  );
}

// Payment Release Modal Component
function PaymentReleaseModal({
  commission,
  onConfirm,
  onCancel
}: {
  commission: Commission;
  onConfirm: (transferReference: string, transferDocumentUrl: string) => void;
  onCancel: () => void;
}) {
  const [transferReference, setTransferReference] = useState('');
  const [transferDocument, setTransferDocument] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferReference.trim() || !transferDocument.trim()) {
      alert('Please provide both transfer reference and document URL');
      return;
    }
    
    onConfirm(transferReference, transferDocument);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Release Payment</h3>
        
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-gray-300 mb-2">
            <strong>Amount:</strong> {formatCommissionAmount(commission.commissionAmount)}
          </p>
          <p className="text-gray-300">
            <strong>Partner:</strong> {StorageService.getPartners().find(p => p.id === commission.partnerId)?.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transfer Reference Number *
            </label>
            <input
              type="text"
              value={transferReference}
              onChange={(e) => setTransferReference(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., TXN123456789"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transfer Document URL *
            </label>
            <input
              type="url"
              value={transferDocument}
              onChange={(e) => setTransferDocument(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/transfer-receipt.pdf"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes about the payment..."
            />
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              Release Payment
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}