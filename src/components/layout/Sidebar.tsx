'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService, useAuth } from '@/lib/auth';
import {
  FileText,
  Settings,
  LogOut,
  User,
  Bell,
  HelpCircle,
  Users,
  GraduationCap,
  Building,
  BookOpen,
  Truck,
  DollarSign,
} from 'lucide-react';

interface SidebarProps {
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentUser } = useAuth();

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  const adminMenuItems = [
    {
      name: 'Applications',
      href: '/admin/applications',
      icon: FileText,
    },
    {
      name: 'Partners',
      href: '/admin/partners',
      icon: Users,
    },
    {
      name: 'Students',
      href: '/admin/students',
      icon: GraduationCap,
    },
    {
      name: 'Universities',
      href: '/admin/universities',
      icon: Building,
    },
    {
      name: 'Programs',
      href: '/admin/programs',
      icon: BookOpen,
    },
    {
      name: 'Logistics Partners',
      href: '/admin/logistics-partners',
      icon: Truck,
    },
    {
      name: 'Commission',
      href: '/admin/commission',
      icon: DollarSign,
    },
  ];

  const partnerMenuItems = [
    {
      name: 'Applications',
      href: '/partner/applications',
      icon: FileText,
    },
    {
      name: 'Students',
      href: '/partner/students',
      icon: GraduationCap,
    },
    {
      name: 'Knowledge Hub',
      href: '/partner/knowledge-hub',
      icon: BookOpen,
    },
    {
      name: 'Commission',
      href: '/partner/commission',
      icon: DollarSign,
    },
    {
      name: 'Logistics Partners',
      href: '/partner/logistics-partners',
      icon: Truck,
    },
  ];


  const menuItems = isAdmin ? adminMenuItems : partnerMenuItems;

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700 text-white w-64">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">UB</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">UniBexs</h1>
            <p className="text-xs text-gray-400">AppleAction System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
            <User className="w-5 h-5 text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">{currentUser?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{currentUser?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

      </nav>

      {/* Footer Actions */}
      <div className="px-4 py-4 border-t border-gray-700 space-y-1">
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200">
          <Bell className="mr-3 h-5 w-5" />
          Notifications
        </button>
        
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200">
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </button>
        
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200">
          <HelpCircle className="mr-3 h-5 w-5" />
          Help
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;