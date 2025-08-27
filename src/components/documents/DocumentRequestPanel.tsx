'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useCallback } from 'react';
import { Application, DocumentRequest } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  User, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Send,
  Filter,
  Search
} from 'lucide-react';

interface DocumentRequestPanelProps {
  application: Application;
  isAdmin: boolean;
  onUpdate: (application: Application) => void;
}

const DocumentRequestPanel: React.FC<DocumentRequestPanelProps> = ({
  application,
  isAdmin,
  onUpdate: _onUpdate
}) => {
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [, setActiveRequest] = useState<DocumentRequest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentUser = AuthService.getCurrentUser();

  const loadDocumentRequests = useCallback(() => {
    const requests = StorageService.getDocumentRequests(application.id);
    setDocumentRequests(requests);
    
    const active = requests.find(req => 
      req.status === 'pending' || req.status === 'partially_submitted'
    );
    setActiveRequest(active || null);
  }, [application.id]);

  useEffect(() => {
    loadDocumentRequests();
  }, [application.id, loadDocumentRequests]);

  const getStatusIcon = (status: DocumentRequest['status']) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'partially_submitted':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: DocumentRequest['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'partially_submitted':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const toggleRequestExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const handleCreateRequest = () => {
    const newRequest: DocumentRequest = {
      id: `docreq-${Date.now()}`,
      applicationId: application.id,
      requestedBy: currentUser?.id || 'admin',
      requestedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      stage: application.currentStage || 1,
      requestSource: 'Admin',
      documents: [
        { 
          id: '1', 
          type: 'passport', 
          description: 'Valid passport copy', 
          mandatory: true, 
          status: 'pending' 
        },
        { 
          id: '2', 
          type: 'academic_transcripts', 
          description: 'Official academic transcripts', 
          mandatory: true, 
          status: 'pending' 
        },
        { 
          id: '3', 
          type: 'financial_documents', 
          description: 'Bank statements (last 3 months)', 
          mandatory: true, 
          status: 'pending' 
        },
        { 
          id: '4', 
          type: 'english_proficiency', 
          description: 'IELTS/TOEFL test results', 
          mandatory: false, 
          status: 'pending' 
        }
      ],
      notes: 'Standard document request for application review'
    };

    StorageService.addDocumentRequest(newRequest);
    loadDocumentRequests();
    setShowCreateForm(false);
  };

  const handleDeleteRequest = (requestId: string) => {
    if (confirm('Are you sure you want to delete this document request?')) {
      // TODO: Implement deleteDocumentRequest method in StorageService
      // StorageService.deleteDocumentRequest(requestId);
      console.log('Delete request:', requestId);
      loadDocumentRequests();
    }
  };

  const filteredRequests = documentRequests.filter(request => {
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (searchTerm && !request.notes?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !request.documents.some(doc => doc.type.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const getCompletionPercentage = (request: DocumentRequest) => {
    const mandatory = request.documents.filter(doc => doc.mandatory);
    const completed = mandatory.filter(doc => doc.status === 'approved' || doc.status === 'uploaded');
    return mandatory.length > 0 ? Math.round((completed.length / mandatory.length) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Document Requests</h2>
            <p className="text-indigo-100">
              {isAdmin ? 'Manage document requests for this application' : 'View document requirements and status'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-indigo-200" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-3xl font-bold">{documentRequests.length}</p>
            <p className="text-sm text-indigo-100">Total Requests</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-3xl font-bold">
              {documentRequests.filter(req => req.status === 'pending').length}
            </p>
            <p className="text-sm text-indigo-100">Pending</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-3xl font-bold">
              {documentRequests.filter(req => req.status === 'submitted').length}
            </p>
            <p className="text-sm text-indigo-100">Submitted</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-3xl font-bold">
              {documentRequests.filter(req => req.status === 'approved').length}
            </p>
            <p className="text-sm text-indigo-100">Approved</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="partially_submitted">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Create Request Form */}
      {showCreateForm && isAdmin && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Document Request</h3>
          <p className="text-gray-600 mb-4">
            This will create a standard document request with common requirements. You can customize it after creation.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateRequest}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Request
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Document Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {documentRequests.length === 0 ? 'No Document Requests' : 'No Requests Found'}
            </h3>
            <p className="text-gray-500">
              {documentRequests.length === 0 
                ? 'No document requests have been created for this application yet.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {isAdmin && documentRequests.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create First Request
              </button>
            )}
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Request Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleRequestExpanded(request.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {expandedRequests.has(request.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      {getStatusIcon(request.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Document Request #{request.id.split('-')[1]}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created {formatDateTime(request.requestedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>By {request.requestSource}</span>
                        </div>
                        {request.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Due {formatDateTime(request.dueDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs text-gray-600">{getCompletionPercentage(request)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getCompletionPercentage(request)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Request"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Request"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(request.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              {expandedRequests.has(request.id) && (
                <div className="border-t border-gray-200 p-6">
                  {/* Notes */}
                  {request.notes && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Instructions</h4>
                          <p className="text-blue-700 text-sm mt-1">{request.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Requirements */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Required Documents</h4>
                    <div className="space-y-3">
                      {request.documents.map((doc) => (
                        <div key={doc.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-3">
                            {getDocumentStatusIcon(doc.status)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium text-gray-900">{doc.type}</h5>
                                {doc.mandatory && (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                              {doc.rejectionReason && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                  <strong>Feedback:</strong> {doc.rejectionReason}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status === 'pending' ? 'pending' : doc.status === 'uploaded' ? 'partially_submitted' : doc.status === 'approved' ? 'submitted' : 'rejected')}`}>
                              {doc.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Last updated {formatDateTime(request.requestedAt)}
                      </div>
                      
                      {isAdmin && request.status === 'submitted' && (
                        <div className="flex space-x-3">
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve All</span>
                          </button>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>Request Changes</span>
                          </button>
                        </div>
                      )}

                      {!isAdmin && (request.status === 'pending' || request.status === 'partially_submitted') && (
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                          <Send className="w-4 h-4" />
                          <span>Upload Documents</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentRequestPanel;