'use client';
/* eslint-disable @typescript-eslint/no-unused-vars, jsx-a11y/alt-text */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Application, Document, DocumentRequest } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import {
  Upload,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  FileText,
  Image,
  Film,
  Archive,
  RefreshCw,
  Trash2,
  MoreVertical,
  Grid,
  List,
  Plus,
  Folder,
} from 'lucide-react';

interface DocumentGridProps {
  application: Application;
  isAdmin: boolean;
  searchQuery: string;
  onUpdate: (application: Application) => void;
}

interface DocumentWithMetadata extends Document {
  requirement?: { id: string; type: string; status: string; mandatory: boolean };
  isLatestVersion: boolean;
  previousVersions: Document[];
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  application,
  isAdmin,
  searchQuery,
  onUpdate,
}) => {
  const [documents, setDocuments] = useState<DocumentWithMetadata[]>([]);
  const [documentRequest, setDocumentRequest] = useState<DocumentRequest | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [, ] = useState<Set<string>>(new Set());
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = AuthService.getCurrentUser();

  const loadDocuments = useCallback(() => {
    const activeRequest = StorageService.getActiveDocumentRequest(application.id);
    setDocumentRequest(activeRequest);

    const allDocs = StorageService.getDocuments(application.id);
    const docsByType = new Map<string, Document[]>();
    
    allDocs.forEach(doc => {
      if (!docsByType.has(doc.type)) {
        docsByType.set(doc.type, []);
      }
      docsByType.get(doc.type)!.push(doc);
    });

    const enhancedDocs: DocumentWithMetadata[] = [];
    docsByType.forEach((docs, type) => {
      docs.sort((a, b) => b.version - a.version);
      
      docs.forEach((doc, index) => {
        const requirement = activeRequest?.documents.find(req => req.type === type);
        enhancedDocs.push({
          ...doc,
          requirement,
          isLatestVersion: index === 0,
          previousVersions: docs.slice(index + 1),
        });
      });
    });

    setDocuments(enhancedDocs);
  }, [application.id]);

  useEffect(() => {
    loadDocuments();
  }, [application.id, loadDocuments]);

  const getFileIcon = (fileName: string, mimeType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    if (mimeType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) {
      return <Film className="w-8 h-8 text-purple-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <Archive className="w-8 h-8 text-orange-500" />;
    }
    return <FileText className="w-8 h-8 text-slate-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'resubmission_required':
        return <RefreshCw className="w-5 h-5 text-orange-500" />;
      case 'uploaded':
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'resubmission_required':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'uploaded':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleDragOver = (e: React.DragEvent, docType?: string) => {
    e.preventDefault();
    setDraggedOver(docType || 'general');
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = async (e: React.DragEvent, requirementId?: string) => {
    e.preventDefault();
    setDraggedOver(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0], requirementId);
    }
  };

  const handleFileUpload = async (file: File, requirementId?: string) => {
    if (!currentUser) return;

    const uploadId = `${Date.now()}-${file.name}`;
    setUploadProgress({ ...uploadProgress, [uploadId]: 0 });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[uploadId] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [uploadId]: current + 10 };
        });
      }, 200);

      // Create file data URL
      const fileDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Find existing document version
      const existingDoc = documents.find(d => d.requirement?.id === requirementId && d.isLatestVersion);
      const version = existingDoc ? existingDoc.version + 1 : 1;
      const requirement = documentRequest?.documents.find(req => req.id === requirementId);
      const documentType = requirement?.type || requirementId || 'general';

      const newDocument: Document = {
        id: StorageService.generateId('DOC'),
        applicationId: application.id,
        stage: application.currentStage,
        type: documentType,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser.name,
        status: 'pending',
        version,
        parentDocumentId: existingDoc?.id,
        url: fileDataUrl,
        size: file.size,
        mimeType: file.type,
      };

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }));

      // Save document
      StorageService.addDocument(newDocument);

      // Update document request if exists
      if (documentRequest && requirement) {
        const updatedRequirements = documentRequest.documents.map(doc => {
          if (doc.id === requirementId) {
            return { ...doc, status: 'uploaded' as const, documentId: newDocument.id };
          }
          return doc;
        });

        const allUploaded = updatedRequirements.every(
          doc => !doc.mandatory || doc.status !== 'pending'
        );

        const updatedRequest: DocumentRequest = {
          ...documentRequest,
          documents: updatedRequirements,
          status: allUploaded ? 'submitted' : 'partially_submitted',
        };

        StorageService.updateDocumentRequest(updatedRequest);
      }

      // Update application
      const updatedApp = {
        ...application,
        currentStatus: 'documents_submitted',
        nextAction: 'Admin reviewing documents',
        nextActor: 'Admin' as const,
        updatedAt: new Date().toISOString(),
      };

      StorageService.updateApplication(updatedApp);
      onUpdate(updatedApp);
      loadDocuments();

      // Clean up progress after delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newPrev = { ...prev };
          delete newPrev[uploadId];
          return newPrev;
        });
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => {
        const newPrev = { ...prev };
        delete newPrev[uploadId];
        return newPrev;
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (searchQuery && !doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && doc.status !== selectedCategory) {
      return false;
    }
    return doc.isLatestVersion;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.fileName.localeCompare(b.fileName);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  });

  const categories = [
    { key: 'all', label: 'All Documents', count: documents.filter(d => d.isLatestVersion).length },
    { key: 'pending', label: 'Pending Upload', count: documents.filter(d => d.status === 'pending' && d.isLatestVersion).length },
    { key: 'uploaded', label: 'Under Review', count: documents.filter(d => (d.requirement?.status === 'uploaded' || d.status === 'pending') && d.isLatestVersion).length },
    { key: 'approved', label: 'Approved', count: documents.filter(d => d.status === 'approved' && d.isLatestVersion).length },
    { key: 'rejected', label: 'Rejected', count: documents.filter(d => d.status === 'rejected' && d.isLatestVersion).length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Document Management
            </h2>
            <p className="text-slate-600">
              {isAdmin ? 'Review and manage application documents' : 'Upload and track your documents'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sort Options */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'status')}
              className="px-3 py-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-white/60'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-white/60'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Button */}
            {!isAdmin && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Upload Files
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                selectedCategory === category.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/60 text-slate-700 hover:bg-white/80 border border-white/40'
              }`}
            >
              <span>{category.label}</span>
              {category.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedCategory === category.key 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Drag and Drop Zone */}
      {!isAdmin && (
        <div
          ref={dropZoneRef}
          onDragOver={(e) => handleDragOver(e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e)}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            draggedOver === 'general'
              ? 'border-blue-500 bg-blue-50/50 scale-105'
              : 'border-slate-300 bg-white/40 hover:border-slate-400 hover:bg-white/60'
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${draggedOver === 'general' ? 'text-blue-500' : 'text-slate-400'}`} />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {draggedOver === 'general' ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-slate-600 mb-4">or click the upload button to browse files</p>
          <div className="text-sm text-slate-500">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
          </div>
        </div>
      )}

      {/* Document Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} isAdmin={isAdmin} />
          ))}
          
          {/* Upload Progress Cards */}
          {Object.entries(uploadProgress).map(([uploadId, progress]) => (
            <div key={uploadId} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Uploading...</h3>
                  <p className="text-sm text-slate-600">{progress}% complete</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="divide-y divide-slate-200/50">
            {sortedDocuments.map((doc) => (
              <DocumentListItem key={doc.id} document={doc} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedDocuments.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No documents found</h3>
          <p className="text-slate-500">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No documents have been uploaded yet'
            }
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            Array.from(files).forEach(file => handleFileUpload(file));
          }
        }}
      />
    </div>
  );
};

// Document Card Component for Grid View
interface DocumentCardProps {
  document: DocumentWithMetadata;
  isAdmin: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, isAdmin }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {React.cloneElement(getFileIcon(document.fileName, document.mimeType), {
            className: "w-10 h-10"
          })}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 truncate">{document.fileName}</h3>
            <p className="text-sm text-slate-600">Version {document.version}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
          {/* Action Menu */}
          {showActions && (
            <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10 min-w-[120px]">
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              {isAdmin && (
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
            {React.cloneElement(getStatusIcon(document.status), { className: "w-4 h-4" })}
            <span>{document.status.replace(/_/g, ' ')}</span>
          </span>
          <span className="text-xs text-slate-500">
            {document.size && `${(document.size / 1024).toFixed(1)} KB`}
          </span>
        </div>

        <div className="text-xs text-slate-500">
          <p>Uploaded by {document.uploadedBy}</p>
          <p>{new Date(document.uploadedAt).toLocaleString()}</p>
        </div>

        {document.rejectionReason && (
          <div className="p-2 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">{document.rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Document List Item Component for List View
const DocumentListItem: React.FC<DocumentCardProps> = ({ document, isAdmin }) => {
  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-slate-50/50 transition-colors">
      {React.cloneElement(getFileIcon(document.fileName, document.mimeType))}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800 truncate">{document.fileName}</h3>
        <p className="text-sm text-slate-600">
          Version {document.version} • Uploaded by {document.uploadedBy} • {new Date(document.uploadedAt).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
          {React.cloneElement(getStatusIcon(document.status), { className: "w-4 h-4" })}
          <span>{document.status.replace(/_/g, ' ')}</span>
        </span>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded">
            <Download className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function getFileIcon(fileName: string, mimeType?: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
    return <Image className="w-8 h-8 text-blue-500" />;
  }
  if (mimeType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) {
    return <Film className="w-8 h-8 text-purple-500" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
    return <Archive className="w-8 h-8 text-orange-500" />;
  }
  return <FileText className="w-8 h-8 text-slate-500" />;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'resubmission_required':
      return <RefreshCw className="w-5 h-5 text-orange-500" />;
    case 'uploaded':
    case 'pending':
      return <Clock className="w-5 h-5 text-blue-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'resubmission_required':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'uploaded':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export default DocumentGrid;