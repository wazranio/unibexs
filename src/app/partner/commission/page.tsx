'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Commission, CommissionSummary } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import { formatCommissionAmount } from '@/lib/commission/commission-calculator';
import Sidebar from '@/components/layout/Sidebar';
import {
  DollarSign,
  Clock,
  CheckCircle,
  Download,
  Eye,
  TrendingUp,
  AlertCircle,
  Calendar,
  User,
  GraduationCap,
  FileText,
  CreditCard,
} from 'lucide-react';

export default function PartnerCommissionPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  // Memoize user context to prevent infinite loops
  const currentUser = useMemo(() => AuthService.getCurrentUser(), []);
  const isAdmin = useMemo(() => AuthService.isAdmin(), []);

  const loadData = useCallback(() => {
    try {
      setLoading(true);
      
      if (!currentUser) {
        throw new Error('No current user');
      }

      // For partners, only show their own commissions using the partnerId field
      const partnerId = isAdmin ? undefined : currentUser.partnerId;
      const partnerCommissions = partnerId 
        ? StorageService.getCommissionsByPartner(partnerId)
        : StorageService.getCommissions();
      
      const commissionSummary = StorageService.getCommissionSummary(partnerId);
      
      setCommissions(partnerCommissions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setSummary(commissionSummary);
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin]); // Include dependencies to satisfy ESLint

  useEffect(() => {
    loadData();
  }, [loadData]); // Include loadData dependency

  const filteredCommissions = commissions.filter(commission => {
    if (selectedStatus !== 'all' && commission.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const handleConfirmPayment = (commission: Commission) => {
    setSelectedCommission(commission);
    setShowConfirmationModal(true);
  };

  const handleDisputePayment = (commission: Commission) => {
    setSelectedCommission(commission);
    setShowDisputeModal(true);
  };

  const confirmPaymentReceived = () => {
    if (!selectedCommission) return;

    const updatedCommission = {
      ...selectedCommission,
      status: 'commission_paid' as const,
      paidAt: new Date(),
    };

    StorageService.saveCommission(updatedCommission);
    setShowConfirmationModal(false);
    setSelectedCommission(null);
    loadData();
  };

  const submitDispute = (reason: string) => {
    if (!selectedCommission) return;

    const updatedCommission = {
      ...selectedCommission,
      status: 'commission_transfer_disputed' as const,
      paymentNotes: reason,
    };

    StorageService.saveCommission(updatedCommission);
    setShowDisputeModal(false);
    setSelectedCommission(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading your commissions...</div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Your Commissions</h1>
            <p className="text-gray-400">Track your commission earnings and payment status</p>
          </div>

          {/* Commission Summary */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Earned */}
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-green-400 font-bold text-lg">Total Earned</h3>
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-white text-2xl font-bold">{formatCommissionAmount(summary.totalEarned)}</p>
                  <p className="text-green-300 text-sm">{summary.totalStudents} students</p>
                </div>
              </div>

              {/* Pending Review */}
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-yellow-400 font-bold text-lg">Pending Review</h3>
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-white text-2xl font-bold">{formatCommissionAmount(summary.pendingReview)}</p>
                  <p className="text-yellow-300 text-sm">Awaiting admin approval</p>
                </div>
              </div>

              {/* Awaiting Payment */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-blue-400 font-bold text-lg">Awaiting Payment</h3>
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-white text-2xl font-bold">{formatCommissionAmount(summary.awaitingPayment)}</p>
                  <p className="text-blue-300 text-sm">Approved, processing</p>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-purple-400 font-bold text-lg">This Month</h3>
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-white text-2xl font-bold">{formatCommissionAmount(summary.thisMonth)}</p>
                  <p className="text-purple-300 text-sm">Received payments</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions Required Section */}
          {filteredCommissions.some(c => c.status === 'commission_released') && (
            <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-orange-400 mr-3" />
                <h3 className="text-orange-400 font-bold text-lg">Action Required</h3>
              </div>
              <p className="text-orange-200 mb-4">
                You have {filteredCommissions.filter(c => c.status === 'commission_released').length} payment(s) 
                waiting for your confirmation. Please verify and confirm receipt.
              </p>
              <div className="space-y-3">
                {filteredCommissions
                  .filter(c => c.status === 'commission_released')
                  .slice(0, 3)
                  .map(commission => {
                    const student = StorageService.getStudents().find(s => s.id === commission.studentId);
                    return (
                      <div key={commission.id} className="flex items-center justify-between bg-orange-800/20 p-3 rounded-lg">
                        <div>
                          <p className="text-orange-200 font-medium">{student ? `${student.firstName} ${student.lastName}` : 'Unknown'} - {formatCommissionAmount(commission.commissionAmount)}</p>
                          <p className="text-orange-300 text-sm">Released {commission.releasedAt?.toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => handleConfirmPayment(commission)}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
                        >
                          Confirm Receipt
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Filter and Search */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="commission_pending">Pending Review</option>
                  <option value="commission_approved">Approved</option>
                  <option value="commission_released">Payment Sent</option>
                  <option value="commission_paid">Paid</option>
                  <option value="commission_transfer_disputed">Disputed</option>
                </select>
              </div>
              <div></div>
              <div>
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Statement
                </button>
              </div>
            </div>
          </div>

          {/* Commission List */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Program</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredCommissions.map((commission) => {
                    const student = StorageService.getStudents().find(s => s.id === commission.studentId);
                    
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
                            <p className="text-gray-400 text-sm">{(commission.commissionRate * 100).toFixed(1)}% rate</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium mr-2 ${
                              commission.status === 'commission_pending' ? 'bg-yellow-900/30 text-yellow-400' :
                              commission.status === 'commission_approved' ? 'bg-blue-900/30 text-blue-400' :
                              commission.status === 'commission_released' ? 'bg-green-900/30 text-green-400' :
                              commission.status === 'commission_paid' ? 'bg-gray-900/30 text-gray-400' :
                              'bg-red-900/30 text-red-400'
                            }`}>
                              {commission.status === 'commission_pending' ? 'Pending' :
                               commission.status === 'commission_approved' ? 'Approved' :
                               commission.status === 'commission_released' ? 'Payment Sent' :
                               commission.status === 'commission_paid' ? 'Paid' :
                               'Disputed'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-white text-sm">{commission.createdAt.toLocaleDateString()}</p>
                              {commission.paidAt && (
                                <p className="text-gray-400 text-xs">Paid: {commission.paidAt.toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {commission.status === 'commission_released' && (
                              <>
                                <button
                                  onClick={() => handleConfirmPayment(commission)}
                                  className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleDisputePayment(commission)}
                                  className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                                >
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Dispute
                                </button>
                              </>
                            )}
                            
                            {commission.transferDocumentUrl && (
                              <button
                                onClick={() => window.open(commission.transferDocumentUrl, '_blank')}
                                className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Receipt
                              </button>
                            )}

                            <button className="flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg">
                              <Eye className="w-4 h-4 mr-1" />
                              Details
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
                <p className="text-gray-500">Once students enroll, your commissions will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showConfirmationModal && selectedCommission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Payment Receipt</h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-gray-300">
                <strong>Amount:</strong> {formatCommissionAmount(selectedCommission.commissionAmount)}
              </p>
              <p className="text-gray-300">
                <strong>Student:</strong> {(() => {
                  const student = StorageService.getStudents().find(s => s.id === selectedCommission.studentId);
                  return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
                })()}
              </p>
              <p className="text-gray-300">
                <strong>Transfer Reference:</strong> {selectedCommission.transferReference || 'N/A'}
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                Please confirm that you have received this payment in your bank account. 
                Once confirmed, this commission will be marked as paid and completed.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmPaymentReceived}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                Yes, I Received Payment
              </button>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && selectedCommission && (
        <DisputeModal
          commission={selectedCommission}
          onConfirm={submitDispute}
          onCancel={() => setShowDisputeModal(false)}
        />
      )}
    </div>
  );
}

// Dispute Modal Component
function DisputeModal({
  commission,
  onConfirm,
  onCancel
}: {
  commission: Commission;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const predefinedReasons = [
    'Payment not received in bank account',
    'Incorrect amount received',
    'Wrong bank account credited',
    'Payment reference does not match',
    'Other (please specify below)',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalReason = selectedReason === 'Other (please specify below)' 
      ? reason 
      : selectedReason;
      
    if (!finalReason.trim()) {
      alert('Please select or specify a reason for the dispute');
      return;
    }
    
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Dispute Payment</h3>
        
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-gray-300 mb-2">
            <strong>Amount:</strong> {formatCommissionAmount(commission.commissionAmount)}
          </p>
          <p className="text-gray-300">
            <strong>Transfer Reference:</strong> {commission.transferReference || 'N/A'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Dispute *
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((predefinedReason, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name="disputeReason"
                    value={predefinedReason}
                    checked={selectedReason === predefinedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-300 text-sm">{predefinedReason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Other (please specify below)' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Please specify
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe the issue..."
                required
              />
            </div>
          )}

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> Submitting a dispute will notify our admin team. 
              We will investigate and resolve the issue as quickly as possible.
            </p>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              Submit Dispute
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