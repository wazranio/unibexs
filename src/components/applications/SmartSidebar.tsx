'use client';

import React, { useState } from 'react';
import { Student, Partner, Application } from '@/types';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Shield,
  Heart,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface SmartSidebarProps {
  student: Student;
  partner: Partner | null;
  application: Application;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const SmartSidebar: React.FC<SmartSidebarProps> = ({
  student,
  partner,
  application,
  collapsed,
  onToggleCollapse,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['student', 'partner']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone formatting - could be enhanced
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  if (collapsed) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 hover:bg-slate-50 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
        
        {/* Collapsed Icons */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-center p-3 bg-blue-50/50 rounded-xl" title={`${student.firstName} ${student.lastName}`}>
            <User className="w-6 h-6 text-blue-600" />
          </div>
          
          {partner && (
            <div className="flex items-center justify-center p-3 bg-green-50/50 rounded-xl" title={partner.name}>
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collapse Button */}
      <div className="flex justify-end">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Student Information Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <button
          onClick={() => toggleSection('student')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">Student</h3>
              <p className="text-sm text-slate-600">{student.firstName} {student.lastName}</p>
            </div>
          </div>
          {expandedSections.has('student') ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {expandedSections.has('student') && (
          <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
            {/* Student Avatar */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </span>
              </div>
              <h4 className="font-semibold text-slate-800">{student.firstName} {student.lastName}</h4>
              <p className="text-sm text-slate-600 flex items-center justify-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>{student.nationality}</span>
              </p>
            </div>

            {/* Student Details */}
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg group hover:bg-slate-100/50 transition-colors">
                <Mail className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 font-medium">Email</p>
                  <p className="text-sm text-slate-800 break-all">{student.email}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(student.email)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                  title="Copy email"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg group hover:bg-slate-100/50 transition-colors">
                <Phone className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 font-medium">Phone</p>
                  <p className="text-sm text-slate-800">{formatPhoneNumber(student.phone)}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(student.phone)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                  title="Copy phone"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Date of Birth */}
              <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 font-medium">Date of Birth</p>
                  <p className="text-sm text-slate-800">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                </div>
              </div>

              {/* Passport */}
              <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg group hover:bg-slate-100/50 transition-colors">
                <Shield className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 font-medium">Passport</p>
                  <p className="text-sm text-slate-800 font-mono">{student.passportNumber}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(student.passportNumber)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                  title="Copy passport number"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 font-medium">Address</p>
                  <p className="text-sm text-slate-800">{student.address}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {student.emergencyContact && (
              <div className="border-t border-slate-200/50 pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Heart className="w-4 h-4 text-red-500" />
                  <h5 className="font-medium text-slate-800">Emergency Contact</h5>
                </div>
                <div className="space-y-2 pl-6">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="text-sm font-medium text-slate-800">{student.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Relationship</p>
                    <p className="text-sm font-medium text-slate-800">{student.emergencyContact.relationship}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="text-sm font-medium text-slate-800">{formatPhoneNumber(student.emergencyContact.phone)}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(student.emergencyContact?.phone || '')}
                      className="p-1 hover:bg-slate-200 rounded transition-all"
                      title="Copy emergency contact phone"
                    >
                      <Copy className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Partner Information Card */}
      {partner && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <button
            onClick={() => toggleSection('partner')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-800">Partner</h3>
                <p className="text-sm text-slate-600">{partner.name}</p>
              </div>
            </div>
            {expandedSections.has('partner') ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedSections.has('partner') && (
            <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
              {/* Partner Logo/Initial */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">
                    {partner.name.charAt(0)}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800">{partner.name}</h4>
              </div>

              {/* Partner Details */}
              <div className="space-y-3">
                {/* Contact Person */}
                <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg">
                  <User className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 font-medium">Contact Person</p>
                    <p className="text-sm text-slate-800">{partner.contactPerson}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg group hover:bg-slate-100/50 transition-colors">
                  <Mail className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 font-medium">Email</p>
                    <p className="text-sm text-slate-800 break-all">{partner.email}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => copyToClipboard(partner.email)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                      title="Copy email"
                    >
                      <Copy className="w-4 h-4 text-slate-500" />
                    </button>
                    <a
                      href={`mailto:${partner.email}`}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                      title="Send email"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg group hover:bg-slate-100/50 transition-colors">
                  <Phone className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 font-medium">Phone</p>
                    <p className="text-sm text-slate-800">{formatPhoneNumber(partner.phone)}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => copyToClipboard(partner.phone)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                      title="Copy phone"
                    >
                      <Copy className="w-4 h-4 text-slate-500" />
                    </button>
                    <a
                      href={`tel:${partner.phone}`}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                      title="Call"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 font-medium">Address</p>
                    <p className="text-sm text-slate-800">{partner.address}</p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 font-medium">Partner Since</p>
                    <p className="text-sm text-slate-800">{partner.createdAt ? new Date(partner.createdAt).getFullYear() : 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Application Stats</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Current Stage</span>
            <span className="font-semibold text-blue-600">{application.currentStage}/5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Priority</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              application.priority === 'high' ? 'bg-red-100 text-red-700' :
              application.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {application.priority}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Created</span>
            <span className="text-sm text-slate-800">{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Last Update</span>
            <span className="text-sm text-slate-800">{application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSidebar;